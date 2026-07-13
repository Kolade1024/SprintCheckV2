/**
 * Server-only environment access for the BFF layer.
 *
 * The upstream base URL and ApiKey are intentionally NOT prefixed with
 * NEXT_PUBLIC_ — they are read here, on the server, and never shipped to the
 * browser. `VITE_*` fallbacks keep parity with the legacy env file.
 */

export interface ServerEnv {
  /** Upstream SprintCheck API base, no trailing slash. */
  baseUrl: string;
  /** Public ApiKey sent on the unauthenticated /auth/* routes. */
  apiKey: string;
}

let cached: ServerEnv | null = null;

export function serverEnv(): ServerEnv {
  if (cached) return cached;

  const baseUrl =
    process.env.SPRINTCHECK_API_BASE_URL ?? process.env.VITE_API_BASE_URL;
  const apiKey = process.env.SPRINTCHECK_API_KEY ?? process.env.VITE_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Missing SPRINTCHECK_API_BASE_URL / SPRINTCHECK_API_KEY. " +
        "Copy .env.example to .env and fill in the values.",
    );
  }

  cached = { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
  return cached;
}
