"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { NavSection, Realm } from "@/lib/docs/spec";
import MethodBadge from "./MethodBadge";
import { ChevronDown } from "@/components/icons";

const REALM_DOT: Record<Realm, string> = {
  public: "bg-body/40",
  apikey: "bg-brand",
  merchant: "bg-[#2e90fa]",
};

export default function SidebarNav({
  nav,
  onNavigate,
}: {
  nav: NavSection[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const activeSlug = pathname === "/docs" ? "" : pathname.replace(/^\/docs\//, "");

  const activeSectionIdx = nav.findIndex((s) => s.items.some((i) => i.slug === activeSlug));
  const [open, setOpen] = useState<boolean[]>(() =>
    nav.map((_, i) => i <= 1 || i === activeSectionIdx)
  );

  // Keep the section containing the current page expanded as the user navigates.
  useEffect(() => {
    if (activeSectionIdx >= 0) {
      setOpen((prev) => prev.map((v, i) => (i === activeSectionIdx ? true : v)));
    }
  }, [activeSectionIdx]);

  return (
    <nav aria-label="API reference" className="flex flex-col gap-1 pb-16">
      {nav.map((section, i) => {
        const expanded = open[i];
        return (
          <div key={section.label} className="pt-2 first:pt-0">
            <button
              type="button"
              onClick={() => setOpen((prev) => prev.map((v, j) => (j === i ? !v : v)))}
              aria-expanded={expanded}
              className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-body transition-colors hover:text-ink"
            >
              {section.realm ? (
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${REALM_DOT[section.realm]}`}
                />
              ) : null}
              <span className="flex-1">{section.label}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 text-body/50 transition-transform group-hover:text-body ${
                  expanded ? "" : "-rotate-90"
                }`}
              />
            </button>

            <div className={expanded ? "block" : "hidden"}>
              <ul className="mt-0.5 flex flex-col border-l border-line pl-1">
                {section.items.map((it) => {
                  const href = it.slug ? `/docs/${it.slug}` : "/docs";
                  const active = it.slug === activeSlug;
                  return (
                    <li key={href} className="relative">
                      {active ? (
                        <span
                          aria-hidden="true"
                          className="absolute -left-[5px] top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-brand"
                        />
                      ) : null}
                      <Link
                        href={href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-2 rounded-md py-[5px] pl-2 pr-1.5 text-[13px] leading-5 transition-colors ${
                          active
                            ? "font-semibold text-brand-accent"
                            : "text-body hover:bg-black/[0.04] hover:text-ink dark:hover:bg-white/[0.06]"
                        }`}
                      >
                        <span className="min-w-0 flex-1 truncate">{it.label}</span>
                        {it.method ? <MethodBadge method={it.method} size="sm" /> : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
