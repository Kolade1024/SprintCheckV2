"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "@/components/icons";

/* ------------------------------------------------------------------ data */

type TxType = "API" | "Dashboard" | "Top-up";

type Txn = {
  description: string;
  kind: "Debit" | "Credit";
  id: string;
  type: TxType;
  date: string;
  amount: number; // signed; 0 renders as +₦0
  pre: number;
  post: number;
};

const TXNS: Txn[] = [
  { description: "Face Detection", kind: "Debit", id: "#a4965935", type: "API", date: "Aug 26, 11:42 PM", amount: 0, pre: 3430, post: 3430 },
  { description: "Face Detection", kind: "Debit", id: "#2b0f4678", type: "API", date: "Aug 26, 11:42 PM", amount: 0, pre: 3430, post: 3430 },
  { description: "Facial Verification", kind: "Debit", id: "#1_746298", type: "API", date: "Aug 08, 11:19 AM", amount: -10, pre: 3450, post: 3440 },
  { description: "Facial Verification", kind: "Debit", id: "#1_145495", type: "API", date: "Aug 07, 04:48 PM", amount: -10, pre: 3460, post: 3450 },
  { description: "BVN Verification", kind: "Debit", id: "#3c46d0c1", type: "API", date: "Aug 01, 04:50 PM", amount: -60, pre: 3640, post: 3580 },
  { description: "BVN Verification", kind: "Debit", id: "#3c46d0c2", type: "API", date: "Aug 01, 04:50 PM", amount: -60, pre: 3700, post: 3640 },
  { description: "BVN Verification", kind: "Debit", id: "#3c46d0c3", type: "API", date: "Aug 01, 04:50 PM", amount: -60, pre: 3760, post: 3700 },
  { description: "Wallet Top-up", kind: "Credit", id: "#top_2034", type: "Top-up", date: "Jul 30, 10:02 AM", amount: 5000, pre: 1300, post: 6300 },
  { description: "NIN Verification", kind: "Debit", id: "#5f1a2b3c", type: "API", date: "Jul 29, 02:15 PM", amount: -40, pre: 1340, post: 1300 },
  { description: "Wallet Top-up", kind: "Credit", id: "#top_2033", type: "Top-up", date: "Jul 28, 09:00 AM", amount: 2000, pre: 300, post: 2300 },
  { description: "Phone Verification", kind: "Debit", id: "#7d8e9f01", type: "Dashboard", date: "Jul 27, 05:30 PM", amount: -15, pre: 315, post: 300 },
  { description: "Address Verification", kind: "Debit", id: "#a1b2c3d4", type: "Dashboard", date: "Jul 26, 11:00 AM", amount: -25, pre: 340, post: 315 },
];

const PAGE_SIZE = 8;
const TABS = ["All", "API", "Dashboard", "Top-up"] as const;

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const naira = (n: number) => `₦${Math.abs(n).toLocaleString("en-US")}`;

/* --------------------------------------------------------------- widgets */

function TypePill({ type }: { type: TxType }) {
  return (
    <span
      className={`inline-flex rounded-pill px-2.5 py-1 text-stat-label font-medium ${
        type === "Dashboard"
          ? "bg-ink/5 text-body"
          : "bg-subtle text-brand-accent"
      }`}
    >
      {type}
    </span>
  );
}

/* ------------------------------------------------------------------ page */

export default function BillingPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (tab === "All") return TXNS;
    return TXNS.filter((t) => t.type === tab);
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
              Billing
            </h1>
            <p className="mt-1 text-lead text-body">
              Manage your subscription, invoices, and payment methods.
            </p>
          </motion.div>

          {/* Top cards */}
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {/* Wallet balance (wide) */}
            <motion.section
              {...fadeUp}
              transition={{ duration: 0.55, delay: 0.05, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col justify-between gap-6 rounded-panel border border-line bg-white p-7 shadow-glass md:col-span-2"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-body">
                    <Wallet className="h-4 w-4" />
                    <span className="text-stat-label font-semibold uppercase tracking-wide">
                      Wallet balance
                    </span>
                  </div>
                  <div className="mt-3 text-[44px] font-extrabold leading-none tracking-[-1.5px] text-ink md:text-[52px]">
                    ₦3,430
                    <span className="text-[24px] font-bold text-body">.00</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-btn bg-brand px-6 text-base font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px"
                >
                  <Plus className="h-4 w-4" />
                  Top up
                </button>
              </div>
            </motion.section>

            {/* Spend this month */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.12, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col gap-4 rounded-panel border border-line bg-white p-6 shadow-glass"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-card bg-red-50 text-red-500">
                <TrendingDown className="h-5 w-5" />
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-[34px] font-extrabold leading-none tracking-[-1px] text-ink">
                  ₦445
                </span>
                <span className="mt-1 text-base font-medium text-ink">Spend this month</span>
                <span className="text-small text-body">Across 9 endpoints</span>
              </div>
            </motion.div>

            {/* Top-ups this month */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.19, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col gap-4 rounded-panel border border-line bg-white p-6 shadow-glass"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-card bg-success/10 text-success">
                <TrendingUp className="h-5 w-5" />
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-[34px] font-extrabold leading-none tracking-[-1px] text-ink">
                  ₦7,000
                </span>
                <span className="mt-1 text-base font-medium text-ink">Top-ups this month</span>
                <span className="text-small text-body">2 successful</span>
              </div>
            </motion.div>
          </div>

          {/* Transactions */}
          <motion.section
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="mt-6 rounded-panel border border-line bg-white p-6 shadow-glass md:p-7"
          >
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-card-title font-bold text-ink">Transactions</h2>
                <p className="text-small text-body">Real-time wallet movements.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex rounded-pill border border-line bg-subtle p-1">
                  {TABS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => changeTab(t)}
                      className="relative rounded-pill px-3.5 py-1.5 text-small font-medium transition-colors"
                    >
                      {tab === t && (
                        <motion.span
                          layoutId="billing-tab"
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

                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-btn border border-line bg-white px-4 py-2 text-small font-medium text-ink shadow-card transition-colors hover:bg-subtle"
                >
                  <Calendar className="h-4 w-4 text-body" />
                  Select period
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-btn border border-line bg-white px-4 py-2 text-small font-medium text-ink shadow-card transition-colors hover:bg-subtle"
                >
                  <Filter className="h-4 w-4 text-body" />
                  Filter
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse">
                <thead>
                  <tr className="border-b border-line text-left text-stat-label uppercase tracking-wide text-body">
                    <th className="pb-3 font-medium">Description</th>
                    <th className="pb-3 font-medium">Transaction ID</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 text-right font-medium">Amount</th>
                    <th className="pb-3 text-right font-medium">Pre wallet</th>
                    <th className="pb-3 text-right font-medium">Post wallet</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t) => {
                    const credit = t.kind === "Credit";
                    const negative = t.amount < 0;
                    return (
                      <tr
                        key={t.id}
                        className="border-b border-line/70 last:border-0 transition-colors hover:bg-subtle/50"
                      >
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-pill ${
                                credit ? "bg-success/10 text-success" : "bg-subtle text-brand"
                              }`}
                            >
                              {credit ? (
                                <ArrowDownLeft className="h-4 w-4" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4" />
                              )}
                            </span>
                            <div>
                              <div className="text-base font-semibold text-ink">{t.description}</div>
                              <div className="text-stat-label text-body">{t.kind}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4 font-mono text-small text-body">{t.id}</td>
                        <td className="py-4 pr-4">
                          <TypePill type={t.type} />
                        </td>
                        <td className="py-4 pr-4 text-small text-body">{t.date}</td>
                        <td
                          className={`py-4 pr-4 text-right text-small font-semibold ${
                            negative ? "text-red-500" : "text-success"
                          }`}
                        >
                          {negative ? "-" : "+"}
                          {naira(t.amount)}
                        </td>
                        <td className="py-4 pr-4 text-right text-small text-body">{naira(t.pre)}</td>
                        <td className="py-4 text-right text-small font-medium text-ink">{naira(t.post)}</td>
                      </tr>
                    );
                  })}
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
                transactions
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
