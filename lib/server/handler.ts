import { NextResponse } from "next/server";
import { getSessionToken } from "./session";
import { UpstreamError } from "./upstream";

/**
 * Controller plumbing shared by every /api route: JSON error shaping,
 * upstream error passthrough, and the session guard.
 *
 * Route handlers stay thin — parse input, call a service, return data.
 */

export function unauthorized(): never {
  throw new UpstreamError("Your session has expired. Sign in again.", 401);
}

/** Returns the bearer token for the current session or fails with a 401. */
export function requireSession(): string {
  const token = getSessionToken();
  if (!token) unauthorized();
  return token;
}

type HandlerResult = NextResponse | Response | object;

/**
 * Wraps a route handler with uniform error handling. Errors always reach the
 * client as `{ message }` with an appropriate status — never a stack trace.
 */
export function apiHandler<Args extends unknown[]>(
  handler: (...args: Args) => Promise<HandlerResult>,
): (...args: Args) => Promise<Response> {
  return async (...args: Args) => {
    try {
      const result = await handler(...args);
      return result instanceof Response ? result : NextResponse.json(result);
    } catch (error) {
      if (error instanceof UpstreamError) {
        return NextResponse.json(
          { message: error.message, ...(error.fieldErrors ? { errors: error.fieldErrors } : {}) },
          { status: error.status },
        );
      }
      console.error("[api] unhandled error:", error);
      return NextResponse.json(
        { message: "Something went wrong on our side. Try again." },
        { status: 500 },
      );
    }
  };
}

/** Safely parses a JSON request body, tolerating an empty body. */
export async function readJson<T = Record<string, unknown>>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
}
