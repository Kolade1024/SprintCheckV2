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
  body?: unknown;
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

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        Authorization: authorizationHeader(auth),
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
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
