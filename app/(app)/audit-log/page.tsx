"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EmptyState, ErrorState, LoadingState } from "@/components/dashboard/AsyncState";
import DateRangePicker from "@/components/dashboard/DateRangePicker";
import DetailModal, { DetailCard, DetailRow } from "@/components/dashboard/DetailModal";
import Select from "@/components/dashboard/Select";
import { ChevronLeft, ChevronRight, Filter, Search, X } from "@/components/icons";
import { appApi } from "@/lib/client/endpoints";
import { ApiError } from "@/lib/client/http";
import type { AuditLogEntry, AuditLogPage, AuditSeverity } from "@/lib/shared/types";

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50] as const;

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

/* ------------------------------------------------------------------ helpers */

function formatTime(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const SEVERITY_STYLES: Record<AuditSeverity, { cls: string; dot: string; label: string }> = {
  info: { cls: "bg-success/10 text-success", dot: "bg-success", label: "Info" },
  warning: { cls: "bg-star/10 text-star", dot: "bg-star", label: "Warning" },
  critical: { cls: "bg-red-500/10 text-red-500", dot: "bg-red-500", label: "Critical" },
};

function SeverityBadge({ severity }: { severity: AuditSeverity }) {
  const { cls, dot, label } = SEVERITY_STYLES[severity];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-stat-label font-semibold ${cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ filters */

interface Filters {
  severity: AuditSeverity | "";
  search: string;
  from: string;
  to: string;
}

const EMPTY_FILTERS: Filters = { severity: "", search: "", from: "", to: "" };

const SEVERITY_OPTIONS = [
  { value: "", label: "All severities" },
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "critical", label: "Critical" },
];

/**
 * Three controls cover the useful cuts of this log: free text (which the API
 * matches against action, target and actor), severity, and a date range.
 * Filters apply on submit so typing doesn't fire a request per keystroke.
 */
function FilterBar({
  value,
  onApply,
  onReset,
}: {
  value: Filters;
  onApply: (next: Filters) => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState<Filters>(value);
  useEffect(() => setDraft(value), [value]);

  const dirty = Object.values(value).some(Boolean);
  const set = <K extends keyof Filters>(key: K, next: Filters[K]) =>
    setDraft((d) => ({ ...d, [key]: next }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onApply(draft);
      }}
      className="mb-6 flex flex-wrap items-center gap-3 border-b border-line pb-6"
    >
      <div className="relative min-w-[220px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
        <input
          value={draft.search}
          onChange={(e) => set("search", e.target.value)}
          aria-label="Search the audit log"
          placeholder="Search actions, actors or targets…"
          className="h-10 w-full rounded-btn border border-line bg-white pl-9 pr-3 text-small text-ink outline-none transition-colors placeholder:text-body/70 focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div className="w-[150px]">
        <Select
          size="sm"
          ariaLabel="Filter by severity"
          value={draft.severity}
          onChange={(next) => set("severity", next as Filters["severity"])}
          options={SEVERITY_OPTIONS}
        />
      </div>

      <DateRangePicker
        ariaLabel="Filter by date range"
        from={draft.from}
        to={draft.to}
        onChange={(from, to) => setDraft((d) => ({ ...d, from, to }))}
        // Last control on the row — anchor right so the popover stays in view.
        align="right"
        className="w-[210px]"
      />

      <button
        type="submit"
        className="inline-flex h-10 items-center justify-center gap-2 rounded-btn bg-brand px-4 text-small font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px"
      >
        <Filter className="h-4 w-4" />
        Apply
      </button>

      {dirty && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-btn px-3 text-small font-medium text-body transition-colors hover:bg-subtle hover:text-ink"
        >
          <X className="h-4 w-4" />
          Clear
        </button>
      )}
    </form>
  );
}

/* --------------------------------------------------------------- detail modal */

function AuditDetailModal({ entry, onClose }: { entry: AuditLogEntry; onClose: () => void }) {
  const metadata = Object.entries(entry.metadata);

  return (
    <DetailModal ariaLabel={`Audit log entry ${entry.id}`} onClose={onClose}>
      <DetailCard>
        <DetailRow label="ID" value={entry.id || "—"} />
        <DetailRow label="Severity" value={<SeverityBadge severity={entry.severity} />} />
        <DetailRow label="Action" value={entry.actionLabel || entry.action || "—"} />
        <DetailRow label="Action code" value={entry.action || "—"} />
      </DetailCard>

      <DetailCard>
        <DetailRow label="Actor" value={entry.actorName || "—"} />
        <DetailRow label="Email" value={entry.actorEmail || "—"} />
        <DetailRow label="Role" value={entry.actorRole || "—"} />
        <DetailRow label="Time" value={formatTime(entry.createdAt)} />
        <DetailRow label="IP Address" value={entry.ip || "—"} />
        <DetailRow label="Browser" value={entry.browser || "—"} />
      </DetailCard>

      <DetailCard>
        <DetailRow label="Target" value={entry.target || "—"} />
        <DetailRow label="Target ID" value={entry.targetId || "—"} />
        {metadata.map(([key, value]) => (
          <DetailRow key={key} label={key} value={String(value)} />
        ))}
      </DetailCard>
    </DetailModal>
  );
}

/* ------------------------------------------------------------------ page */

export default function AuditLogPage() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<number>(ROWS_PER_PAGE_OPTIONS[0]);
  const [selected, setSelected] = useState<AuditLogEntry | null>(null);

  const [result, setResult] = useState<AuditLogPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generation, setGeneration] = useState(0);

  // Filtering and paging happen upstream, so every change is a fresh request.
  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError(null);
    appApi
      .auditLogs(
        {
          severity: filters.severity,
          search: filters.search,
          from: filters.from,
          to: filters.to,
          perPage,
          page,
        },
        controller.signal,
      )
      .then((data) => {
        if (controller.signal.aborted) return;
        setResult(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || (err instanceof DOMException && err.name === "AbortError")) {
          return;
        }
        setError(
          err instanceof ApiError || err instanceof Error
            ? err.message
            : "Could not load the audit log.",
        );
        setLoading(false);
      });

    return () => controller.abort();
  }, [filters, page, perPage, generation]);

  const refetch = useCallback(() => setGeneration((g) => g + 1), []);

  const rows = useMemo(() => result?.entries ?? [], [result]);
  const meta = result?.meta;
  const total = meta?.total ?? rows.length;
  const pageCount = Math.max(1, meta?.lastPage ?? 1);
  const current = meta?.currentPage ?? page;
  const firstRow = total === 0 ? 0 : (current - 1) * perPage + 1;

  function applyFilters(next: Filters) {
    setFilters(next);
    setPage(1);
  }

  function changePerPage(next: number) {
    setPerPage(next);
    setPage(1);
  }

  const filtered = Object.values(filters).some(Boolean);

  return (
    <>
      <motion.div {...fadeUp} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }} className="mt-8">
        <h1 className="text-[34px] font-extrabold tracking-[-1px] text-gradient">Audit Log</h1>
        <p className="mt-1 text-lead text-body">
          Every account action, with actor, target, and severity.
        </p>
      </motion.div>

      <motion.section
        {...fadeUp}
        transition={{ duration: 0.5, delay: 0.12, ease: [0.4, 0, 0.2, 1] }}
        className="mt-8 rounded-panel border border-line bg-white p-6 shadow-glass md:p-7"
      >
        <FilterBar
          value={filters}
          onApply={applyFilters}
          onReset={() => applyFilters(EMPTY_FILTERS)}
        />

        {loading ? (
          <LoadingState label="Loading audit log…" />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : rows.length === 0 ? (
          <EmptyState
            message={
              filtered
                ? "No entries match these filters. Try widening the date range or clearing them."
                : "No audit activity yet. Account actions will appear here."
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] border-collapse">
                <thead>
                  <tr className="border-b border-line text-left text-stat-label uppercase tracking-wide text-body">
                    <th className="pb-3 font-medium">ID</th>
                    <th className="pb-3 font-medium">Actor</th>
                    <th className="pb-3 font-medium">Action</th>
                    <th className="pb-3 font-medium">Target</th>
                    <th className="pb-3 font-medium">IP</th>
                    <th className="pb-3 font-medium">Time</th>
                    <th className="pb-3 text-right font-medium">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((entry, i) => (
                    <tr
                      key={`${entry.id}-${i}`}
                      onClick={() => setSelected(entry)}
                      className="cursor-pointer border-b border-line/70 last:border-0 transition-colors hover:bg-subtle/50"
                    >
                      <td className="py-4 pr-4 font-mono text-small font-semibold text-ink">
                        {entry.id || "—"}
                      </td>
                      <td className="py-4 pr-4">
                        <div className="text-base font-semibold text-ink">
                          {entry.actorName || "—"}
                        </div>
                        <div className="text-stat-label text-body">{entry.actorEmail}</div>
                      </td>
                      <td className="py-4 pr-4 text-small text-ink">
                        {entry.actionLabel || entry.action || "—"}
                      </td>
                      <td className="py-4 pr-4 text-small text-body">
                        {entry.target ? `${entry.target}${entry.targetId ? ` #${entry.targetId}` : ""}` : "—"}
                      </td>
                      <td className="py-4 pr-4 font-mono text-small text-body">
                        {entry.ip || "—"}
                      </td>
                      <td className="py-4 pr-4 text-small text-body">
                        {formatTime(entry.createdAt)}
                      </td>
                      <td className="py-4 text-right">
                        <SeverityBadge severity={entry.severity} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer / pagination */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-small text-body">
                <span className="font-semibold text-ink">
                  {firstRow}–{firstRow + rows.length - 1}
                </span>{" "}
                of <span className="font-semibold text-ink">{total}</span>
              </p>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-small text-body">
                  Rows per page:
                  <div className="w-[84px]">
                    <Select
                      size="sm"
                      ariaLabel="Rows per page"
                      value={String(perPage)}
                      onChange={(next) => changePerPage(Number(next))}
                      options={ROWS_PER_PAGE_OPTIONS.map((n) => ({
                        value: String(n),
                        label: String(n),
                      }))}
                      // Sits at the foot of the table, so open upwards.
                      drop="up"
                      align="right"
                    />
                  </div>
                </div>

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
                  <span className="text-small font-medium text-ink">
                    {current}/{pageCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    disabled={current >= pageCount}
                    aria-label="Next page"
                    className="flex h-9 w-9 items-center justify-center rounded-pill border border-line bg-white text-body shadow-card transition-colors hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.section>

      <AnimatePresence>
        {selected && <AuditDetailModal entry={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </>
  );
}
