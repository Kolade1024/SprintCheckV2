/**
 * Thin fetch wrapper for the app's own /api routes (the BFF). Auth rides on
 * the httpOnly session cookie, so there is nothing token-related here.
 */

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

export async function request<T>(
  path: string,
  { method = "GET", body, signal }: RequestOptions = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
      credentials: "same-origin",
    });
  } catch (error) {
    // Let AbortErrors propagate untouched so callers can ignore cancellations.
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError("Network error — check your connection and try again.", 0);
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    /* empty or non-JSON body */
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && typeof (payload as { message?: unknown }).message === "string"
        ? (payload as { message: string }).message
        : `Request failed (${response.status}).`;
    throw new ApiError(message, response.status);
  }

  return payload as T;
}
