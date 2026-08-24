import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_HINT_COOKIE } from "@/lib/shared/constants";

/**
 * Session management for the BFF.
 *
 * The upstream bearer token is stored in an httpOnly cookie so it is never
 * readable from browser JavaScript. Every /api route reads it back here and
 * forwards it upstream — the token itself never appears in a response body.
 */

const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60;

export function createSession(token: string, remember = false): void {
  // Without `remember` both cookies are session-scoped and die with the browser.
  const lifetime = remember ? { maxAge: THIRTY_DAYS_SECONDS } : {};

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...lifetime,
  });

  // Readable flag so public pages can render the signed-out header immediately
  // instead of probing the API to find out. Holds no token — only "1".
  cookies().set(SESSION_HINT_COOKIE, "1", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...lifetime,
  });
}

export function destroySession(): void {
  cookies().delete(SESSION_COOKIE);
  cookies().delete(SESSION_HINT_COOKIE);
}

export function getSessionToken(): string | null {
  return cookies().get(SESSION_COOKIE)?.value ?? null;
}
