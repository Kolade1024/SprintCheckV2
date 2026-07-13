/**
 * Name of the httpOnly cookie carrying the upstream bearer token. Lives in a
 * dependency-free module so both the middleware (edge bundle) and the
 * server-side session helpers can import it.
 */
export const SESSION_COOKIE = "sc_session";
