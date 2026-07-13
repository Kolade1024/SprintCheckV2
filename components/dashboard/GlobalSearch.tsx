"use client";

import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PRIMARY_NAV, PROFILE_NAV } from "@/components/dashboard/Sidebar";
import { appApi } from "@/lib/client/endpoints";
import {
  ArrowUpRight,
  CheckCircle,
  Receipt,
  Search,
  Tag,
  XCircle,
  type IconProps,
} from "@/components/icons";
import type { PricingService, VerificationLog, WalletTransaction } from "@/lib/shared/types";

/**
 * Global search for the Topbar. Searches app pages instantly; on first open
 * it also pulls the account's verification history, wallet transactions, and
 * pricing list once, then filters everything client-side as you type.
 *
 * Shortcuts: Ctrl/Cmd+K or "/" to focus, ↑/↓ + Enter to pick, Esc to close.
 */

type SearchHit = {
  key: string;
  category: "Pages" | "Verifications" | "Transactions" | "Services";
  icon: ComponentType<IconProps>;
  title: string;
  subtitle?: string;
  href: string;
  danger?: boolean;
};

type SearchData = {
  history: VerificationLog[];
  transactions: WalletTransaction[];
  pricing: PricingService[];
};

const MAX_PER_CATEGORY = 5;

const PAGE_HITS: SearchHit[] = [...PRIMARY_NAV, PROFILE_NAV].map((item) => ({
  key: `page-${item.href}`,
  category: "Pages",
  icon: item.icon,
  title: item.label,
  href: item.href,
}));

function matches(query: string, ...haystacks: (string | null | undefined)[]): boolean {
  return haystacks.some((h) => h?.toLowerCase().includes(query));
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function buildHits(query: string, data: SearchData | null): SearchHit[] {
  const q = query.trim().toLowerCase();

  const pages = q ? PAGE_HITS.filter((p) => matches(q, p.title)) : PAGE_HITS;
  if (!q || !data) return pages.slice(0, q ? MAX_PER_CATEGORY : 7);

  const verifications = data.history
    .filter((v) => matches(q, v.endpoint, v.name, String(v.id)))
    .slice(0, MAX_PER_CATEGORY)
    .map<SearchHit>((v) => ({
      key: `verification-${v.id}`,
      category: "Verifications",
      icon: v.status === "successful" ? CheckCircle : XCircle,
      danger: v.status === "failed",
      title: `${v.endpoint} — ${v.name || String(v.id)}`,
      subtitle: `${v.status === "successful" ? "Successful" : "Failed"} · ${formatDate(v.createdAt)}`,
      href: "/history",
    }));

  const transactions = data.transactions
    .filter((t) => matches(q, t.description, String(t.id), t.kind))
    .slice(0, MAX_PER_CATEGORY)
    .map<SearchHit>((t) => ({
      key: `txn-${t.id}`,
      category: "Transactions",
      icon: Receipt,
      title: t.description,
      subtitle: `${t.kind === "Credit" ? "+" : "-"}₦${Math.abs(t.amount).toLocaleString("en-US")} · ${formatDate(t.createdAt)}`,
      href: "/billing",
    }));

  const services = data.pricing
    .filter((s) => matches(q, s.name, s.category, s.code))
    .slice(0, MAX_PER_CATEGORY)
    .map<SearchHit>((s) => ({
      key: `service-${s.code}`,
      category: "Services",
      icon: Tag,
      title: s.name,
      subtitle: `₦${s.cost.toLocaleString("en-US")} per verification`,
      href: "/pricing",
    }));

  return [...pages.slice(0, MAX_PER_CATEGORY), ...verifications, ...transactions, ...services];
}

export default function GlobalSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [data, setData] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  // Lazy-load the searchable data once, the first time the palette opens.
  useEffect(() => {
    if (!open || fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    Promise.allSettled([appApi.history(), appApi.walletHistory(), appApi.pricing()]).then(
      ([history, transactions, pricing]) => {
        setData({
          history: history.status === "fulfilled" ? history.value : [],
          transactions: transactions.status === "fulfilled" ? transactions.value : [],
          pricing: pricing.status === "fulfilled" ? pricing.value : [],
        });
        setLoading(false);
      },
    );
  }, [open]);

  // Ctrl/Cmd+K or "/" focuses the search from anywhere in the shell.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const inField =
        e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !inField)) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  const hits = useMemo(() => buildHits(query, data), [query, data]);

  // Keep the highlighted row valid as results change.
  useEffect(() => {
    setActive(0);
  }, [query, open]);

  function go(hit: SearchHit) {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    router.push(hit.href);
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && hits[active]) {
      e.preventDefault();
      go(hits[active]);
    } else if (e.key === "Escape") {
      if (query) setQuery("");
      else {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
  }

  // Group hits for rendering while keeping `active` indexed on the flat list.
  const grouped = useMemo(() => {
    const groups: { category: SearchHit["category"]; items: { hit: SearchHit; index: number }[] }[] =
      [];
    hits.forEach((hit, index) => {
      const group = groups.find((g) => g.category === hit.category);
      if (group) group.items.push({ hit, index });
      else groups.push({ category: hit.category, items: [{ hit, index }] });
    });
    return groups;
  }, [hits]);

  return (
    <div ref={containerRef} className="relative flex-1">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-body" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={onInputKeyDown}
        placeholder="Search verifications, transactions, pages…"
        aria-label="Search"
        aria-expanded={open}
        role="combobox"
        aria-controls="global-search-results"
        className="h-12 w-full rounded-panel border border-line bg-white pl-12 pr-14 text-base text-ink shadow-card outline-none transition-colors placeholder:text-body/70 focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
      <kbd className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-line bg-subtle px-1.5 py-0.5 text-[11px] font-medium text-body md:block">
        Ctrl K
      </kbd>

      <AnimatePresence>
        {open && (
          <motion.div
            id="global-search-results"
            initial={{ opacity: 0, y: 6, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.995 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 max-h-[70vh] overflow-y-auto rounded-panel border border-line bg-white p-2 shadow-glass"
          >
            {grouped.map(({ category, items }) => (
              <div key={category} className="mb-1 last:mb-0">
                <div className="px-3 pb-1 pt-2 text-stat-label font-semibold uppercase tracking-wide text-body">
                  {category}
                </div>
                {items.map(({ hit, index }) => {
                  const Icon = hit.icon;
                  return (
                    <button
                      key={hit.key}
                      type="button"
                      onClick={() => go(hit)}
                      onMouseEnter={() => setActive(index)}
                      className={`flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-left transition-colors ${
                        index === active ? "bg-subtle" : ""
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-card bg-subtle ${
                          hit.danger ? "text-red-500" : "text-brand"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-small font-medium text-ink">
                          {hit.title}
                        </span>
                        {hit.subtitle && (
                          <span className="block truncate text-stat-label text-body">
                            {hit.subtitle}
                          </span>
                        )}
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-body/50" />
                    </button>
                  );
                })}
              </div>
            ))}

            {query.trim() && !loading && grouped.length === 0 && (
              <p className="px-3 py-6 text-center text-small text-body">
                No results for “{query.trim()}”.
              </p>
            )}
            {loading && (
              <p className="px-3 py-3 text-center text-stat-label text-body">
                Loading your account data…
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
