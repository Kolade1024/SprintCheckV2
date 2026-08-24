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
  /**
   * The unscrubbed upstream text, kept so services can branch on a known
   * upstream quirk. Server-side only — `apiHandler` serializes `message` and
   * `fieldErrors` and nothing else, so this must never be added to that shape.
   */
  readonly detail?: string;

  constructor(
    message: string,
    status: number,
    fieldErrors?: Record<string, string[]>,
    detail?: string,
  ) {
    super(message);
    this.name = "UpstreamError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.detail = detail;
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

/**
 * Markers of a Laravel/Guzzle internal leaking into a 4xx message. Upstream
 * mixes genuine user-facing copy ("Invalid credentials") with raw exception
 * text in the same `message` field, so we can't blanket-replace 4xx bodies
 * without wrecking the forms — we replace only what looks like an internal.
 */
const INTERNALS = [
  /SQLSTATE|SQL:|Integrity constraint/i,
  /\b(?:App|Illuminate|Symfony|GuzzleHttp|Laravel)\\/, // PHP namespaces
  /\.php\b|\/var\/www\/|\/home\/[^\s]*\/(?:app|vendor)\//i, // file paths
  /Stack trace:|^#\d+\s|\bon line \d+/im,
  /Call to (?:a member function|undefined)/i,
  /No query results for model/i,
  /\b(?:cURL error|Client error|Server error)\b/i,
  /https?:\/\//i, // third-party webhook URLs
  /\b\w*(?:Exception|Throwable)\b/,
];

/** Status-appropriate copy for when the upstream message can't be shown. */
function genericFor(status: number): string {
  if (status === 401 || status === 403) return "You're not authorized to do that.";
  if (status === 404) return "We couldn't find what you asked for.";
  if (status === 429) return "Too many requests. Wait a moment and try again.";
  if (status === 422) return "Some of the details you entered aren't valid.";
  return "The verification service couldn't process that request.";
}

/** Passes clean upstream copy through; swaps anything that looks internal. */
function scrub(message: string, status: number): string {
  const leaks = message.length > 200 || INTERNALS.some((pattern) => pattern.test(message));
  return leaks ? genericFor(status) : message;
}

/** Field errors render next to inputs, so they get the same treatment. */
function scrubFields(
  fieldErrors: Record<string, string[]> | undefined,
  status: number,
): Record<string, string[]> | undefined {
  if (!fieldErrors) return undefined;
  const cleaned: Record<string, string[]> = {};
  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (!Array.isArray(messages)) continue;
    cleaned[field] = messages.map((message) =>
      typeof message === "string" ? scrub(message, status) : genericFor(status),
    );
  }
  return cleaned;
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
      const raw = messageFrom(payload, "no message");
      console.error(`[upstream] ${method} ${path} → ${response.status}:`, raw);
      throw new UpstreamError(
        "The verification service had a problem with that request. Try again shortly.",
        response.status,
        undefined,
        raw,
      );
    }

    const raw = messageFrom(payload, `Request failed (${response.status}).`);
    const safe = scrub(raw, response.status);
    if (safe !== raw) {
      console.error(`[upstream] ${method} ${path} → ${response.status} (scrubbed):`, raw);
    }
    throw new UpstreamError(safe, response.status, scrubFields(fieldErrors, response.status), raw);
  }

  // Some endpoints return 200 with `status: false` on soft failures.
  if (payload && typeof payload === "object" && (payload as { status?: unknown }).status === false) {
    throw new UpstreamError(scrub(messageFrom(payload, "Request failed."), 400), 400);
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
