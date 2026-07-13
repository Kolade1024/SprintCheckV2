"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { EmptyState, ErrorState, LoadingState } from "@/components/dashboard/AsyncState";
import {
  ACTIVITY_RANGES,
  buildActivitySeries,
  type ActivityRange,
} from "@/lib/shared/activity";
import type { VerificationLog } from "@/lib/shared/types";

function Bar({
  value,
  max,
  kind,
  delay,
}: {
  value: number;
  max: number;
  kind: "verified" | "failed";
  delay: number;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <motion.div
      // Re-animate when the range changes and bars are re-measured.
      key={`${kind}-${value}-${max}`}
      initial={{ height: 0 }}
      animate={{ height: `${pct}%` }}
      transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
      title={`${value} ${kind}`}
      className={`w-3.5 rounded-t-[5px] md:w-5 ${
        kind === "verified"
          ? "bg-gradient-to-b from-[#9a6cf4] to-brand"
          : "bg-gradient-to-b from-[#fb923c] to-[#ef4444]"
      }`}
    />
  );
}

export default function ActivityChart({
  logs,
  loading,
  error,
  onRetry,
}: {
  logs: VerificationLog[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}) {
  const [range, setRange] = useState<ActivityRange>("7D");

  const series = useMemo(() => buildActivitySeries(logs, range), [logs, range]);

  const subtitle =
    range === "7D"
      ? "Last 7 days · Verified vs Failed"
      : range === "30D"
        ? "Last 30 days · Verified vs Failed"
        : "Last 90 days · Verified vs Failed";

  return (
    <section className="rounded-panel border border-line bg-white p-6 shadow-glass md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-card-title font-bold text-ink">Verification activity</h2>
          <p className="text-small text-body">{subtitle}</p>
        </div>

        <div className="inline-flex rounded-pill border border-line bg-subtle p-1">
          {ACTIVITY_RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={`rounded-pill px-3.5 py-1.5 text-small font-medium transition-colors ${
                range === r
                  ? "bg-white text-ink shadow-card"
                  : "text-body hover:text-ink"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading activity…" />
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : series.isEmpty ? (
        <EmptyState message={`No verifications in the last ${range.replace("D", "")} days.`} />
      ) : (
        <>
          {/* Plot */}
          <div className="mt-8 flex gap-3">
            {/* Y axis */}
            <div className="flex w-9 flex-col justify-between py-1 text-right text-stat-label text-body">
              {series.ticks.map((t) => (
                <span key={t}>{Math.round(t)}</span>
              ))}
            </div>

            {/* Bars + gridlines */}
            <div className="relative flex-1">
              <div className="absolute inset-0 flex flex-col justify-between">
                {series.ticks.map((t) => (
                  <div key={t} className="border-t border-dashed border-line" />
                ))}
              </div>

              <div className="relative flex h-[260px] items-end justify-between gap-1">
                {series.buckets.map((b, i) => (
                  <div
                    key={b.label}
                    className="flex h-full flex-1 items-end justify-center gap-1.5"
                  >
                    <Bar value={b.verified} max={series.max} kind="verified" delay={i * 0.04} />
                    <Bar value={b.failed} max={series.max} kind="failed" delay={i * 0.04 + 0.02} />
                  </div>
                ))}
              </div>

              {/* X axis labels */}
              <div className="mt-3 flex justify-between">
                {series.buckets.map((b) => (
                  <span
                    key={b.label}
                    className="flex-1 text-center text-stat-label text-body"
                  >
                    {b.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-5 flex items-center justify-center gap-6">
            <span className="flex items-center gap-2 text-small text-body">
              <span className="h-3 w-3 rounded-full bg-gradient-to-b from-[#9a6cf4] to-brand" />
              verified
            </span>
            <span className="flex items-center gap-2 text-small text-body">
              <span className="h-3 w-3 rounded-full bg-gradient-to-b from-[#fb923c] to-[#ef4444]" />
              failed
            </span>
          </div>
        </>
      )}
    </section>
  );
}
