"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { ComponentType } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import {
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Globe,
  Pulse,
  TrendingUp,
  XCircle,
  Zap,
  type IconProps,
} from "@/components/icons";

/* ------------------------------------------------------------------ data */

type Status = "successful" | "failed" | "pending";
type Source = "API" | "Dashboard";

type Request = {
  endpoint: string;
  txn: string;
  name: string;
  source: Source;
  performedBy: string;
  date: string;
  status: Status;
};

const REQUESTS: Request[] = [
  { endpoint: "Face Compare", txn: "txn_9912", name: "User", source: "API", performedBy: "User 1", date: "Aug 26, 2025, 11:45 PM", status: "successful" },
  { endpoint: "Face Liveness", txn: "txn_9911", name: "User", source: "API", performedBy: "User 1", date: "Aug 26, 2025, 11:43 PM", status: "successful" },
  { endpoint: "Face Detection", txn: "txn_9910", name: "User", source: "API", performedBy: "User 1", date: "Aug 26, 2025, 11:41 PM", status: "successful" },
  { endpoint: "Face Detection", txn: "txn_9909", name: "User", source: "API", performedBy: "User 1", date: "Aug 26, 2025, 11:41 PM", status: "failed" },
  { endpoint: "Facial Verification", txn: "txn_9908", name: "User", source: "API", performedBy: "User 1", date: "Aug 7, 2025, 4:47 PM", status: "successful" },
  { endpoint: "Driver License Verification", txn: "txn_9907", name: "Samuel Odejinmi", source: "API", performedBy: "User 1", date: "Jul 29, 2025, 3:10 AM", status: "successful" },
  { endpoint: "Voters Verification", txn: "txn_9906", name: "Blessing Aanuoluwapo Afolabi", source: "API", performedBy: "User 1", date: "Jul 29, 2025, 3:09 AM", status: "successful" },
  { endpoint: "BVN Verification", txn: "txn_9905", name: "Chinedu Okeke", source: "Dashboard", performedBy: "kolade", date: "Jul 28, 2025, 1:12 PM", status: "successful" },
  { endpoint: "BVN Verification", txn: "txn_9904", name: "Aisha Bello", source: "API", performedBy: "User 1", date: "Jul 27, 2025, 9:30 AM", status: "successful" },
  { endpoint: "NIN Verification", txn: "txn_9903", name: "Tunde Bakare", source: "Dashboard", performedBy: "kolade", date: "Jul 26, 2025, 6:15 PM", status: "failed" },
  { endpoint: "Phone Verification", txn: "txn_9902", name: "Ngozi Eze", source: "API", performedBy: "User 1", date: "Jul 25, 2025, 2:00 PM", status: "pending" },
  { endpoint: "Address Verification", txn: "txn_9901", name: "Ibrahim Musa", source: "API", performedBy: "User 1", date: "Jul 24, 2025, 10:05 AM", status: "successful" },
];

const PAGE_SIZE = 8;
const TABS = ["All", "Successful", "Failed", "Pending"] as const;

type Stat = {
  icon: ComponentType<IconProps>;
  value: string;
  label: string;
  sub: string;
  tone: "brand" | "green" | "red";
};

const STATS: Stat[] = [
  { icon: Pulse, value: "12", label: "Total requests", sub: "All time", tone: "brand" },
  { icon: TrendingUp, value: "75%", label: "Success rate", sub: "Last 30 days", tone: "green" },
  { icon: XCircle, value: "2", label: "Failed", sub: "Needs review", tone: "red" },
  { icon: Zap, value: "₦498", label: "Spend", sub: "This period", tone: "brand" },
];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

/* --------------------------------------------------------------- widgets */

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const { icon: Icon, value, label, sub, tone } = stat;
  const toneClass =
    tone === "green"
      ? "text-success"
      : tone === "red"
        ? "text-red-500"
        : "text-brand";
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

function StatusBadge({ status }: { status: Status }) {
  const map = {
    successful: { cls: "bg-success/10 text-success", icon: CheckCircle, label: "Successful" },
    failed: { cls: "bg-red-500/10 text-red-500", icon: XCircle, label: "Failed" },
    pending: { cls: "bg-star/10 text-star", icon: Clock, label: "Pending" },
  } as const;
  const { cls, icon: Icon, label } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-stat-label font-semibold uppercase tracking-wide ${cls}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function SourcePill({ source }: { source: Source }) {
  return (
    <span
      className={`inline-flex rounded-pill px-2.5 py-1 text-stat-label font-medium ${
        source === "API"
          ? "bg-subtle text-brand-accent"
          : "bg-ink/5 text-body"
      }`}
    >
      {source}
    </span>
  );
}

/* ------------------------------------------------------------------ page */

export default function HistoryPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (tab === "All") return REQUESTS;
    return REQUESTS.filter((r) => r.status === tab.toLowerCase());
  }, [tab]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  function changeTab(next: (typeof TABS)[number]) {
    setTab(next);
    setPage(1);
  }

  return (
    <div className="flex min-h-screen bg-[#fbfbfe]">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1200px] px-5 py-6 md:px-8">
          <Topbar />

          <motion.div {...fadeUp} transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }} className="mt-8">
            <h1 className="text-[34px] font-extrabold tracking-[-1px] text-gradient">
              History
            </h1>
            <p className="mt-1 text-lead text-body">
              Every verification request, with full status and audit detail.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {STATS.map((stat, i) => (
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

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-btn border border-line bg-white px-4 py-2 text-small font-medium text-ink shadow-card transition-colors hover:bg-subtle"
                >
                  <Globe className="h-4 w-4 text-body" />
                  Source: All
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-btn border border-line bg-white px-4 py-2 text-small font-medium text-ink shadow-card transition-colors hover:bg-subtle"
                >
                  <Calendar className="h-4 w-4 text-body" />
                  Last 30 days
                </button>
              </div>
            </div>

            {/* Rows */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse">
                <thead>
                  <tr className="border-b border-line text-left align-top text-stat-label uppercase tracking-wide text-body">
                    <th className="pb-3 font-medium">Endpoint</th>
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Source</th>
                    <th className="pb-3 font-medium">Performed by</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.txn}
                      className="border-b border-line/70 last:border-0 transition-colors hover:bg-subtle/50"
                    >
                      <td className="py-4 pr-4">
                        <div className="font-semibold uppercase tracking-wide text-brand-accent">
                          {r.endpoint}
                        </div>
                        <div className="mt-0.5 font-mono text-stat-label text-body">
                          {r.txn}
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-small text-ink">{r.name}</td>
                      <td className="py-4 pr-4">
                        <SourcePill source={r.source} />
                      </td>
                      <td className="py-4 pr-4 text-small text-body">{r.performedBy}</td>
                      <td className="py-4 pr-4 text-small text-body">{r.date}</td>
                      <td className="py-4 pr-4">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="py-4 text-right">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 rounded-btn border border-line bg-white px-3.5 py-1.5 text-small font-medium text-ink shadow-card transition-colors hover:bg-subtle"
                        >
                          <Eye className="h-4 w-4 text-body" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-small text-body">
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
                of <span className="font-semibold text-ink">{filtered.length}</span>{" "}
                requests
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
          </motion.section>
        </div>
      </div>
    </div>
  );
}
