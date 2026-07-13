"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Method } from "@/lib/docs/spec";
import MethodBadge from "./MethodBadge";
import { Search } from "@/components/icons";

export type SearchDoc = {
  slug: string;
  label: string;
  section: string;
  method?: Method;
  path?: string;
  keywords?: string;
};

function score(doc: SearchDoc, q: string): number {
  const hay = `${doc.label} ${doc.path ?? ""} ${doc.section} ${doc.keywords ?? ""}`.toLowerCase();
  const label = doc.label.toLowerCase();
  if (!hay.includes(q)) return -1;
  if (label.startsWith(q)) return 0;
  if (label.includes(q)) return 1;
  if ((doc.path ?? "").toLowerCase().includes(q)) return 2;
  return 3;
}

export default function DocsSearch({ docs }: { docs: SearchDoc[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  // The modal is portalled to the docs root: the topbar's backdrop-filter
  // makes it the containing block for fixed descendants (clipping the
  // overlay), and the docs root keeps the .dark theme scope intact.
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  useEffect(() => setPortalEl(document.getElementById("sc-docs")), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docs.slice(0, 8);
    return docs
      .map((d) => ({ d, s: score(d, q) }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => a.s - b.s)
      .slice(0, 10)
      .map((r) => r.d);
  }, [docs, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setCursor(0);
  }, []);

  const go = useCallback(
    (doc: SearchDoc) => {
      close();
      router.push(doc.slug ? `/docs/${doc.slug}` : "/docs");
    },
    [close, router]
  );

  // Global shortcuts: Cmd/Ctrl+K or "/" to open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => setCursor(0), [query]);

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-idx="${cursor}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-full max-w-[280px] items-center gap-2 rounded-btn border border-line bg-surface px-3 text-small text-body/70 shadow-card transition-colors hover:border-body/30 hover:text-body"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate text-left">Search endpoints…</span>
        <kbd className="hidden rounded-md border border-line bg-subtle px-1.5 py-0.5 font-mono text-[10px] text-body md:inline-block">
          ⌘K
        </kbd>
      </button>

      {open && portalEl ? createPortal(
        <div
          className="fixed inset-0 z-[70] flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-[2px] dark:bg-black/60"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Search the API reference"
        >
          <div className="w-full max-w-[560px] overflow-hidden rounded-panel border border-line bg-surface shadow-glass">
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="h-4 w-4 shrink-0 text-body/60" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setCursor((c) => Math.min(c + 1, results.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setCursor((c) => Math.max(c - 1, 0));
                  } else if (e.key === "Enter" && results[cursor]) {
                    go(results[cursor]);
                  }
                }}
                placeholder="Search endpoints, guides, paths…"
                aria-label="Search endpoints, guides and paths"
                className="h-12 w-full bg-transparent text-base text-ink outline-none placeholder:text-body/50"
              />
              <kbd className="rounded-md border border-line bg-subtle px-1.5 py-0.5 font-mono text-[10px] text-body">
                esc
              </kbd>
            </div>

            {results.length > 0 ? (
              <ul ref={listRef} className="max-h-[320px] overflow-y-auto p-2">
                {results.map((doc, i) => (
                  <li key={doc.slug || "intro"}>
                    <button
                      type="button"
                      data-idx={i}
                      onClick={() => go(doc)}
                      onMouseEnter={() => setCursor(i)}
                      className={`flex w-full items-center gap-3 rounded-card px-3 py-2.5 text-left transition-colors ${
                        i === cursor ? "bg-brand/[0.06]" : ""
                      }`}
                    >
                      {doc.method ? (
                        <MethodBadge method={doc.method} size="sm" />
                      ) : (
                        <span className="inline-flex h-[18px] w-11 shrink-0 items-center justify-center rounded-md bg-black/5 font-mono text-[10px] font-semibold uppercase text-body dark:bg-white/10">
                          Guide
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-small font-medium ${i === cursor ? "text-brand-accent" : "text-ink"}`}>
                          {doc.label}
                        </span>
                        <span className="block truncate font-mono text-[11px] text-body/70">
                          {doc.path ?? doc.section}
                        </span>
                      </span>
                      <span className="hidden shrink-0 text-[11px] text-body/50 lg:block">{doc.section}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-10 text-center">
                <p className="text-small font-medium text-ink">No matches for “{query}”</p>
                <p className="mt-1 text-small text-body">
                  Try an endpoint path like /cac/name or a product like BVN.
                </p>
              </div>
            )}
          </div>
        </div>,
        portalEl
      ) : null}
    </>
  );
}
