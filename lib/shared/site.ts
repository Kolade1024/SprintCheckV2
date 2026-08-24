/**
 * Canonical public origin, used for absolute URLs in robots.txt, the sitemap
 * and any future OpenGraph/canonical tags.
 *
 * Resolution order:
 *  1. NEXT_PUBLIC_SITE_URL — set this to the real domain once it's live.
 *  2. VERCEL_PROJECT_PRODUCTION_URL — injected by Vercel on every deployment
 *     and always points at the project's production domain, so previews still
 *     emit production URLs rather than their own throwaway hostnames.
 *  3. localhost, for `next dev`.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

/** Absolute URL for a site-relative path (`/docs` → `https://…/docs`). */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Routes that must never be indexed: the authenticated app shell (behind the
 * middleware redirect), one-time token flows, and the BFF itself.
 */
export const PRIVATE_PATHS = [
  "/api/",
  "/dashboard",
  "/verification",
  "/history",
  "/billing",
  "/developers",
  "/pricing",
  "/audit-log",
  "/support",
  "/profile",
  "/accept-invite",
  "/verify-code",
  "/set-new-password",
];
