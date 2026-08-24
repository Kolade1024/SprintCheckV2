/**
 * Name of the httpOnly cookie carrying the upstream bearer token. Lives in a
 * dependency-free module so both the middleware (edge bundle) and the
 * server-side session helpers can import it.
 */
export const SESSION_COOKIE = "sc_session";

/**
 * Readable companion to SESSION_COOKIE — carries no token, just the fact that
 * a session exists, so client code can tell signed-in from signed-out without
 * a network round trip. Deliberately NOT httpOnly; it must never hold anything
 * secret. Written and cleared only alongside the real cookie in
 * `createSession`/`destroySession`, so the two can't drift apart.
 */
export const SESSION_HINT_COOKIE = "sc_authed";
