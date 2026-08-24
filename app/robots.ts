import type { MetadataRoute } from "next";
import { absoluteUrl, PRIVATE_PATHS } from "@/lib/shared/site";

/** Served at /robots.txt. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The app shell and token flows carry nothing worth indexing and some of
      // it 302s to /signin, which just wastes crawl budget.
      disallow: PRIVATE_PATHS,
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
