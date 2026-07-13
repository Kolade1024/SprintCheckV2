import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/shared/constants";

/**
 * Session management for the BFF.
 *
 * The upstream bearer token is stored in an httpOnly cookie so it is never
 * readable from browser JavaScript. Every /api route reads it back here and
 * forwards it upstream — the token itself never appears in a response body.
 */

const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60;

export function createSession(token: string, remember = false): void {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // Without `remember` the cookie is session-scoped and dies with the browser.
    ...(remember ? { maxAge: THIRTY_DAYS_SECONDS } : {}),
  });
}

export function destroySession(): void {
  cookies().delete(SESSION_COOKIE);
}

export function getSessionToken(): string | null {
  return cookies().get(SESSION_COOKIE)?.value ?? null;
}
