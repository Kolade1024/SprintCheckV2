import type { MetadataRoute } from "next";
import { ENDPOINTS, GUIDES } from "@/lib/docs/spec";
import { absoluteUrl } from "@/lib/shared/site";

/**
 * Served at /sitemap.xml.
 *
 * Docs entries are derived from the same registry that feeds
 * `generateStaticParams`, so a new endpoint or guide appears here without
 * anyone remembering to update a list.
 *
 * Deliberately excluded: the authenticated app shell and token flows (see
 * PRIVATE_PATHS), and the auth pages (/signin, /signup, /forgot-password) —
 * they're crawlable but hold no search value, so they stay out of the sitemap.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const marketing = [
    { path: "/", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/docs", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/sandbox", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/sdks", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/contact", changeFrequency: "yearly" as const, priority: 0.5 },
    { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  const docPages = [...GUIDES, ...ENDPOINTS].map((page) => ({
    path: `/docs/${page.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...marketing, ...docPages].map(({ path, changeFrequency, priority }) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
  }));
}
