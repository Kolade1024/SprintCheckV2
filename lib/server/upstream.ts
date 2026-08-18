import { serverEnv } from "./env";

/**
 * Repository layer: the only place that talks HTTP to the upstream
 * SprintCheck API. Services build on this; route handlers never call it
 * directly.
 *
 * Upstream conventions (verified against the live API):
 *  - Success:            `{ status: true, message?, data? }` or a bare `{ message, token }`
 *  - Validation failure: 422 `{ status: false, message, errors: { field: [msg] } }`
 *  - Bad credentials:    401 `{ message: "Invalid credentials" }`
 *  - Expired session:    401 `{ message: "Unauthenticated." }`
 */

export class UpstreamError extends Error {
  readonly status: number;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = "UpstreamError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export type UpstreamAuth =
  /** Unauthenticated /auth/* routes — sends the public ApiKey. */
  | { kind: "apiKey" }
  /** Authenticated merchant routes — sends the user's bearer token. */
  | { kind: "bearer"; token: string };

interface UpstreamRequest {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  auth: UpstreamAuth;
  /** JSON-encoded, unless it's a FormData (multipart file uploads). */
  body?: unknown;
}

/** Builds a query string from defined, non-empty values. */
export function queryString(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

function authorizationHeader(auth: UpstreamAuth): string {
  return auth.kind === "bearer" ? `Bearer ${auth.token}` : serverEnv().apiKey;
}

function messageFrom(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

export async function upstream<T = unknown>(
  path: string,
  { method = "GET", auth, body }: UpstreamRequest,
): Promise<T> {
  const { baseUrl } = serverEnv();
  // FormData rides through untouched so fetch can set its multipart boundary.
  const isMultipart = body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        Authorization: authorizationHeader(auth),
        ...(body !== undefined && !isMultipart ? { "Content-Type": "application/json" } : {}),
      },
      body: isMultipart ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new UpstreamError("The verification service is unreachable. Try again shortly.", 502);
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // Non-JSON body (e.g. an HTML error page) — fall through to status handling.
  }

  if (!response.ok) {
    const fieldErrors =
      payload && typeof payload === "object" && "errors" in payload
        ? ((payload as { errors: Record<string, string[]> }).errors ?? undefined)
        : undefined;

    // Upstream 5xx bodies are raw Laravel/Guzzle exceptions — they carry stack
    // traces, file paths and third-party webhook URLs. Log them and hand the
    // browser something safe instead.
    if (response.status >= 500) {
      console.error(
        `[upstream] ${method} ${path} → ${response.status}:`,
        messageFrom(payload, "no message"),
      );
      throw new UpstreamError(
        "The verification service had a problem with that request. Try again shortly.",
        response.status,
      );
    }

    throw new UpstreamError(
      messageFrom(payload, `Request failed (${response.status}).`),
      response.status,
      fieldErrors,
    );
  }

  // Some endpoints return 200 with `status: false` on soft failures.
  if (payload && typeof payload === "object" && (payload as { status?: unknown }).status === false) {
    throw new UpstreamError(messageFrom(payload, "Request failed."), 400);
  }

  return payload as T;
}

/**
 * The newer list endpoints (audit logs, notifications) skip Laravel's paginator
 * envelope and answer `{ data: [...], meta: { current_page, last_page, total } }`
 * — a single page at a time, with filtering done upstream.
 */
export async function upstreamList<T = unknown>(
  path: string,
  auth: UpstreamAuth,
): Promise<{ rows: T[]; meta: Record<string, unknown> | undefined }> {
  const envelope = await upstream<{ data?: T[]; meta?: Record<string, unknown> }>(path, { auth });
  return { rows: Array.isArray(envelope?.data) ? envelope.data : [], meta: envelope?.meta };
}

/**
 * Follows a Laravel paginator (`data.data` + `next_page_url`) and returns the
 * merged item list. Capped so a huge account can't stall the request.
 */
export async function upstreamAllPages<T = unknown>(
  path: string,
  auth: UpstreamAuth,
  maxPages = 10,
): Promise<T[]> {
  const items: T[] = [];
  const separator = path.includes("?") ? "&" : "?";

  for (let page = 1; page <= maxPages; page++) {
    const envelope = await upstream<{
      data?: { data?: T[]; next_page_url?: string | null };
    }>(`${path}${separator}page=${page}`, { auth });

    const paginator = envelope?.data;
    items.push(...(paginator?.data ?? []));
    if (!paginator?.next_page_url) break;
  }

  return items;
}
