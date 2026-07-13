import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EndpointDoc from "@/components/docs/EndpointDoc";
import { renderGuide } from "@/components/docs/guides";
import { ENDPOINTS, GUIDES, getEndpoint, getGuide } from "@/lib/docs/spec";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return [
    ...GUIDES.map((g) => ({ slug: g.slug })),
    ...ENDPOINTS.map((e) => ({ slug: e.slug })),
  ];
}

export const dynamicParams = false;

export function generateMetadata({ params }: Props): Metadata {
  const ep = getEndpoint(params.slug);
  if (ep) {
    return { title: ep.name, description: ep.summary };
  }
  const guide = getGuide(params.slug);
  if (guide) {
    return { title: guide.name, description: guide.summary };
  }
  return {};
}

export default function DocsSlugPage({ params }: Props) {
  const ep = getEndpoint(params.slug);
  if (ep) return <EndpointDoc ep={ep} />;

  const guide = renderGuide(params.slug);
  if (guide) return guide;

  notFound();
}
