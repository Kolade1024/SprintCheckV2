import Link from "next/link";
import { NAV_ORDER } from "@/lib/docs/spec";
import { ArrowLeft, ArrowRight } from "@/components/icons";

export default function Pager({ slug }: { slug: string }) {
  const idx = NAV_ORDER.findIndex((i) => i.slug === slug);
  if (idx < 0) return null;
  const prev = NAV_ORDER[idx - 1];
  const next = NAV_ORDER[idx + 1];

  return (
    <nav aria-label="Reference pagination" className="mt-12 flex gap-3 border-t border-line pt-6">
      {prev ? (
        <Link
          href={prev.slug ? `/docs/${prev.slug}` : "/docs"}
          className="group flex min-w-0 flex-1 flex-col gap-1 rounded-card border border-line p-4 transition-colors hover:border-brand/40 hover:bg-brand/[0.03]"
        >
          <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-body">
            <ArrowLeft className="h-3.5 w-3.5" /> Previous
          </span>
          <span className="truncate text-small font-semibold text-ink group-hover:text-brand-accent">
            {prev.label}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
      {next ? (
        <Link
          href={next.slug ? `/docs/${next.slug}` : "/docs"}
          className="group flex min-w-0 flex-1 flex-col items-end gap-1 rounded-card border border-line p-4 text-right transition-colors hover:border-brand/40 hover:bg-brand/[0.03]"
        >
          <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-body">
            Next <ArrowRight className="h-3.5 w-3.5" />
          </span>
          <span className="w-full truncate text-small font-semibold text-ink group-hover:text-brand-accent">
            {next.label}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
