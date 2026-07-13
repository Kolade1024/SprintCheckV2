"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ComponentType } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/dashboard/AsyncState";
import DetailModal, { DetailCard, DetailRow } from "@/components/dashboard/DetailModal";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Pulse,
  TrendingUp,
  XCircle,
  type IconProps,
} from "@/components/icons";
import { appApi } from "@/lib/client/endpoints";
import { useApi } from "@/lib/client/useApi";
import type { VerificationLog, VerificationStatus } from "@/lib/shared/types";

/* ------------------------------------------------------------------ config */

const PAGE_SIZE = 8;
const TABS = ["All", "Successful", "Failed"] as const;

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

/* ------------------------------------------------------------------ helpers */

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type StatCardData = {
  icon: ComponentType<IconProps>;
  value: string;
  label: string;
  sub: string;
  tone: "brand" | "green" | "red";
};

function buildStats(logs: VerificationLog[]): StatCardData[] {
  const total = logs.length;
  const successful = logs.filter((l) => l.status === "successful").length;
  const failed = total - successful;
  const rate = total > 0 ? Math.round((successful / total) * 100) : 0;
  return [
    { icon: Pulse, value: String(total), label: "Total requests", sub: "All time", tone: "brand" },
    { icon: TrendingUp, value: `${rate}%`, label: "Success rate", sub: "All time", tone: "green" },
    { icon: CheckCircle, value: String(successful), label: "Successful", sub: "All time", tone: "green" },
    { icon: XCircle, value: String(failed), label: "Failed", sub: "Needs review", tone: "red" },
  ];
}

/* --------------------------------------------------------------- widgets */

function StatCard({ stat, index }: { stat: StatCardData; index: number }) {
  const { icon: Icon, value, label, sub, tone } = stat;
  const toneClass =
    tone === "green" ? "text-success" : tone === "red" ? "text-red-500" : "text-brand";
  return (
    <motion.div
      {...fadeUp}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.07, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col gap-4 rounded-panel border border-line bg-white p-6 shadow-glass"
    >
      <span className={`flex h-11 w-11 items-center justify-center rounded-card bg-subtle ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-[32px] font-extrabold leading-none tracking-[-1px] text-ink">
          {value}
        </span>
        <span className="mt-1 text-base font-medium text-ink">{label}</span>
        <span className="text-small text-body">{sub}</span>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: VerificationStatus }) {
  const map = {
    successful: { cls: "bg-success/10 text-success", icon: CheckCircle, label: "Successful" },
    failed: { cls: "bg-red-500/10 text-red-500", icon: XCircle, label: "Failed" },
  } as const;
  const { cls, icon: Icon, label } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-stat-label font-semibold uppercase tracking-wide ${cls}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function SourcePill({ source }: { source: string }) {
  const isApi = source.toUpperCase() === "API";
  return (
    <span
      className={`inline-flex rounded-pill px-2.5 py-1 text-stat-label font-medium ${
        isApi ? "bg-subtle text-brand-accent" : "bg-ink/5 text-body"
      }`}
    >
      {source || "—"}
    </span>
  );
}

/* --------------------------------------------------------------- detail modal */

function VerificationDetailModal({
  log,
  onClose,
}: {
  log: VerificationLog;
  onClose: () => void;
}) {
  return (
    <DetailModal ariaLabel={`Verification ${log.id}`} onClose={onClose}>
      <DetailCard>
        <DetailRow label="Reference" value={<span className="font-mono">{String(log.id)}</span>} />
        <DetailRow label="Status" value={<StatusBadge status={log.status} />} />
        <DetailRow label="Endpoint" value={log.endpoint || "—"} />
      </DetailCard>

      <DetailCard>
        <DetailRow label="Subject name" value={log.name || "—"} />
        <DetailRow label="Source" value={<SourcePill source={log.source} />} />
        <DetailRow label="Date" value={formatDate(log.createdAt)} />
      </DetailCard>
    </DetailModal>
  );
}

/* ------------------------------------------------------------------ page */

export default function HistoryPage() {
  const { data, loading, error, refetch } = useApi((signal) => appApi.history(signal));
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<VerificationLog | null>(null);

  const logs = useMemo(() => data ?? [], [data]);
  const stats = useMemo(() => buildStats(logs), [logs]);

  const filtered = useMemo(() => {
    if (tab === "Successful") return logs.filter((l) => l.status === "successful");
    if (tab === "Failed") return logs.filter((l) => l.status === "failed");
    return logs;
  }, [logs, tab]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  function changeTab(next: (typeof TABS)[number]) {
    setTab(next);
    setPage(1);
  }

  return (
    <>
      <motion.div {...fadeUp} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }} className="mt-8">
        <h1 className="text-[34px] font-extrabold tracking-[-1px] text-gradient">History</h1>
        <p className="mt-1 text-lead text-body">
          Every verification request, with full status and audit detail.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} />
        ))}
      </div>

      {/* Table */}
      <motion.section
        {...fadeUp}
        transition={{ duration: 0.5, delay: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="mt-6 rounded-panel border border-line bg-white p-6 shadow-glass md:p-7"
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex rounded-pill border border-line bg-subtle p-1">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => changeTab(t)}
                className="relative rounded-pill px-4 py-1.5 text-small font-medium transition-colors"
              >
                {tab === t && (
                  <motion.span
                    layoutId="history-tab"
                    className="absolute inset-0 rounded-pill bg-white shadow-card"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className={`relative ${tab === t ? "text-ink" : "text-body hover:text-ink"}`}>
                  {t}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <LoadingState label="Loading verification history…" />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : logs.length === 0 ? (
          <EmptyState message="No verifications yet. Requests you make will appear here." />
        ) : (
          <>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse">
                <thead>
                  <tr className="border-b border-line text-left align-top text-stat-label uppercase tracking-wide text-body">
                    <th className="pb-3 font-medium">Endpoint</th>
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Source</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setSelected(r)}
                      className="cursor-pointer border-b border-line/70 last:border-0 transition-colors hover:bg-subtle/50"
                    >
                      <td className="py-4 pr-4">
                        <div className="font-semibold uppercase tracking-wide text-brand-accent">
                          {r.endpoint}
                        </div>
                        <div className="mt-0.5 font-mono text-stat-label text-body">
                          {String(r.id)}
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-small text-ink">{r.name || "—"}</td>
                      <td className="py-4 pr-4">
                        <SourcePill source={r.source} />
                      </td>
                      <td className="py-4 pr-4 text-small text-body">{formatDate(r.createdAt)}</td>
                      <td className="py-4 pr-4">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-small text-body">
                        No requests match this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer / pagination */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-small text-body">
                Showing{" "}
                <span className="font-semibold text-ink">
                  {filtered.length === 0 ? 0 : start + 1}–{start + rows.length}
                </span>{" "}
                of <span className="font-semibold text-ink">{filtered.length}</span> requests
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={current === 1}
                  aria-label="Previous page"
                  className="flex h-9 w-9 items-center justify-center rounded-pill border border-line bg-white text-body shadow-card transition-colors hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    aria-current={current === p ? "page" : undefined}
                    className={`flex h-9 w-9 items-center justify-center rounded-pill text-small font-medium transition-colors ${
                      current === p
                        ? "bg-brand text-offwhite shadow-glow"
                        : "border border-line bg-white text-ink shadow-card hover:bg-subtle"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={current === pageCount}
                  aria-label="Next page"
                  className="flex h-9 w-9 items-center justify-center rounded-pill border border-line bg-white text-body shadow-card transition-colors hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </motion.section>

      <AnimatePresence>
        {selected && (
          <VerificationDetailModal log={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
