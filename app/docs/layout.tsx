import type { Metadata } from "next";
import DocsChrome from "@/components/docs/DocsChrome";
import type { SearchDoc } from "@/components/docs/DocsSearch";
import { ENDPOINTS, GUIDES, NAV } from "@/lib/docs/spec";

export const metadata: Metadata = {
  title: {
    default: "API Reference — SprintCheck",
    template: "%s — SprintCheck API",
  },
  description:
    "Complete reference for the SprintCheck identity verification API: BVN, NIN, voter's card and facial checks, CAC business lookups and merchant account endpoints.",
};

function buildSearchDocs(): SearchDoc[] {
  const sectionOf = (slug: string) =>
    NAV.find((s) => s.items.some((i) => i.slug === slug))?.label ?? "Reference";

  return [
    { slug: "", label: "Introduction", section: "Get started", keywords: "overview quickstart getting started" },
    ...GUIDES.map((g) => ({
      slug: g.slug,
      label: g.name,
      section: sectionOf(g.slug),
      keywords: g.summary,
    })),
    ...ENDPOINTS.map((e) => ({
      slug: e.slug,
      label: e.name,
      section: sectionOf(e.slug),
      method: e.method,
      path: e.path,
      keywords: e.summary,
    })),
  ];
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <DocsChrome nav={NAV} searchDocs={buildSearchDocs()}>
      {children}
    </DocsChrome>
  );
}
