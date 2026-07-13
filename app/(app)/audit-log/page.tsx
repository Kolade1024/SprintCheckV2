"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EmptyState, ErrorState, LoadingState } from "@/components/dashboard/AsyncState";
import DetailModal, { DetailCard, DetailRow } from "@/components/dashboard/DetailModal";
import { ChevronDown, ChevronLeft, ChevronRight } from "@/components/icons";
import { appApi } from "@/lib/client/endpoints";
import { useApi } from "@/lib/client/useApi";
import type { AuditLogEntry, AuditSeverity } from "@/lib/shared/types";

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
  info: { cls: "bg-success/10 text-success", dot: "bg-success", label: "info" },
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

/* --------------------------------------------------------------- detail modal */

function AuditDetailModal({ entry, onClose }: { entry: AuditLogEntry; onClose: () => void }) {
  return (
    <DetailModal ariaLabel={`Audit log entry ${entry.id}`} onClose={onClose}>
      <DetailCard>
        <DetailRow label="ID" value={entry.id || "—"} />
        <DetailRow label="Severity Badge" value={<SeverityBadge severity={entry.severity} />} />
        <DetailRow label="Main Action Title" value={entry.action || "—"} />
      </DetailCard>

      <DetailCard>
        <DetailRow label="Actor" value={entry.actorName || "—"} />
        <DetailRow label="Role" value={entry.actorRole || "—"} />
        <DetailRow label="Time" value={formatTime(entry.createdAt)} />
        <DetailRow label="IP Address" value={entry.ip || "—"} />
        <DetailRow label="Browser" value={entry.browser || "—"} />
      </DetailCard>

      <DetailCard>
        <DetailRow label="Target" value={entry.target || "—"} />
        <DetailRow label="Target Entity" value={entry.targetEntity || "—"} />
        <DetailRow label="Target ID" value={entry.targetId || "—"} />
      </DetailCard>
    </DetailModal>
  );
}

/* ------------------------------------------------------------------ page */

export default function AuditLogPage() {
  const { data, loading, error, refetch } = useApi((signal) => appApi.auditLogs(signal));
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<number>(ROWS_PER_PAGE_OPTIONS[0]);
  const [selected, setSelected] = useState<AuditLogEntry | null>(null);

  const logs = useMemo(() => data ?? [], [data]);

  const pageCount = Math.max(1, Math.ceil(logs.length / perPage));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * perPage;
  const rows = logs.slice(start, start + perPage);

  function changePerPage(next: number) {
    setPerPage(next);
    setPage(1);
  }

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
        {loading ? (
          <LoadingState label="Loading audit log…" />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : logs.length === 0 ? (
          <EmptyState message="No audit activity yet. Account actions will appear here." />
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
                      key={`${entry.id}-${start + i}`}
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
                      <td className="py-4 pr-4 text-small text-ink">{entry.action || "—"}</td>
                      <td className="py-4 pr-4 text-small text-body">{entry.target || "—"}</td>
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
                  {start + 1}–{start + rows.length}
                </span>{" "}
                of <span className="font-semibold text-ink">{logs.length}</span>
              </p>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-small text-body">
                  Rows per page:
                  <span className="relative">
                    <select
                      value={perPage}
                      onChange={(e) => changePerPage(Number(e.target.value))}
                      className="appearance-none rounded-btn border border-line bg-white py-1.5 pl-3 pr-8 text-small font-medium text-ink shadow-card outline-none transition-colors focus:border-brand"
                    >
                      {ROWS_PER_PAGE_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-body" />
                  </span>
                </label>

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
                    disabled={current === pageCount}
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
