"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type Day = { day: string; verified: number; failed: number };

const DATA: Day[] = [
  { day: "14 May", verified: 27, failed: 13 },
  { day: "15 May", verified: 78, failed: 26 },
  { day: "16 May", verified: 13, failed: 29 },
  { day: "17 May", verified: 78, failed: 95 },
  { day: "18 May", verified: 43, failed: 74 },
  { day: "19 May", verified: 23, failed: 62 },
  { day: "20 May", verified: 51, failed: 100 },
  { day: "21 May", verified: 44, failed: 97 },
];

const RANGES = ["7D", "30D", "90D"] as const;
const Y_TICKS = [100, 75, 50, 25, 0];
const MAX = 100;

function Bar({ value, kind, delay }: { value: number; kind: "verified" | "failed"; delay: number }) {
  return (
    <motion.div
      initial={{ height: 0 }}
      whileInView={{ height: `${(value / MAX) * 100}%` }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay, ease: [0.4, 0, 0.2, 1] }}
      className={`w-3.5 rounded-t-[5px] md:w-5 ${
        kind === "verified"
          ? "bg-gradient-to-b from-[#9a6cf4] to-brand"
          : "bg-gradient-to-b from-[#fb923c] to-[#ef4444]"
      }`}
    />
  );
}

export default function ActivityChart() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("7D");

  return (
    <section className="rounded-panel border border-line bg-white p-6 shadow-glass md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-card-title font-bold text-ink">Verification activity</h2>
          <p className="text-small text-body">Last 8 days · Verified vs Failed</p>
        </div>

        <div className="inline-flex rounded-pill border border-line bg-subtle p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
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

      {/* Plot */}
      <div className="mt-8 flex gap-3">
        {/* Y axis */}
        <div className="flex w-7 flex-col justify-between py-1 text-right text-stat-label text-body">
          {Y_TICKS.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>

        {/* Bars + gridlines */}
        <div className="relative flex-1">
          <div className="absolute inset-0 flex flex-col justify-between">
            {Y_TICKS.map((t) => (
              <div key={t} className="border-t border-dashed border-line" />
            ))}
          </div>

          <div className="relative flex h-[260px] items-end justify-between gap-1">
            {DATA.map((d, i) => (
              <div
                key={d.day}
                className="flex h-full flex-1 items-end justify-center gap-1.5"
              >
                <Bar value={d.verified} kind="verified" delay={i * 0.06} />
                <Bar value={d.failed} kind="failed" delay={i * 0.06 + 0.03} />
              </div>
            ))}
          </div>

          {/* X axis labels */}
          <div className="mt-3 flex justify-between">
            {DATA.map((d) => (
              <span
                key={d.day}
                className="flex-1 text-center text-stat-label text-body"
              >
                {d.day}
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
    </section>
  );
}
