"use client";

import { motion } from "framer-motion";
import type { ComponentType } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import CountUp from "@/components/dashboard/CountUp";
import ActivityChart from "@/components/dashboard/ActivityChart";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  FileCheck,
  Pulse,
  Wallet,
  XCircle,
  type IconProps,
} from "@/components/icons";

/* ------------------------------------------------------------------ data */

type Stat = {
  icon: ComponentType<IconProps>;
  value: number;
  label: string;
  delta: string;
  up: boolean;
  progress: number;
  danger?: boolean;
};

const STATS: Stat[] = [
  { icon: Pulse, value: 12486, label: "Total API Calls", delta: "+8.2%", up: true, progress: 55 },
  { icon: FileCheck, value: 9142, label: "Verified documents", delta: "+5.6%", up: true, progress: 58 },
  { icon: CheckCircle, value: 8704, label: "Successful verifications", delta: "+11.3%", up: true, progress: 64 },
  { icon: XCircle, value: 438, label: "Failed verifications", delta: "-2.1%", up: false, progress: 18, danger: true },
];

type Row = {
  ref: string;
  type: string;
  subject: string;
  ok: boolean;
  time: string;
};

const ROWS: Row[] = [
  { ref: "vr_8f3a", type: "BVN", subject: "22*******41", ok: true, time: "2m ago" },
  { ref: "vr_8f29", type: "NIN", subject: "70*******09", ok: true, time: "4m ago" },
  { ref: "vr_8f18", type: "Business", subject: "RC 1429812", ok: false, time: "11m ago" },
  { ref: "vr_8f02", type: "Phone", subject: "+234 803 ***", ok: true, time: "22m ago" },
  { ref: "vr_8ef0", type: "BVN", subject: "22*******07", ok: true, time: "38m ago" },
];

/* ------------------------------------------------------------- animation */

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

/* --------------------------------------------------------------- widgets */

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const { icon: Icon, value, label, delta, up, progress, danger } = stat;
  return (
    <motion.div
      {...fadeUp}
      transition={{ duration: 0.5, delay: 0.15 + index * 0.08, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col gap-4 rounded-panel border border-line bg-white p-5 shadow-glass"
    >
      <div className="flex items-start justify-between">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-card ${
            danger ? "bg-red-50 text-red-500" : "bg-subtle text-brand"
          }`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-stat-label font-semibold ${
            up ? "bg-success/10 text-success" : "bg-red-500/10 text-red-500"
          }`}
        >
          {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {delta}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <CountUp
          value={value}
          className="text-[32px] font-extrabold leading-none tracking-[-1px] text-ink"
        />
        <span className="text-small text-body">{label}</span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-pill bg-subtle">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${progress}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.3 + index * 0.08, ease: [0.4, 0, 0.2, 1] }}
          className={`h-full rounded-pill ${
            danger
              ? "bg-gradient-to-r from-[#fb923c] to-[#ef4444]"
              : "bg-gradient-to-r from-brand-from to-brand-to"
          }`}
        />
      </div>
    </motion.div>
  );
}

function BalanceCard() {
  return (
    <motion.section
      {...fadeUp}
      transition={{ duration: 0.55, delay: 0.05, ease: [0.4, 0, 0.2, 1] }}
      className="relative overflow-hidden rounded-panel bg-brand p-7 text-offwhite shadow-glow md:p-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(40% 60% at 90% 10%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 60%)",
        }}
      />
      <div className="relative flex items-center gap-2.5 text-white/80">
        <span className="flex h-9 w-9 items-center justify-center rounded-card bg-white/15">
          <Wallet className="h-5 w-5" />
        </span>
        <span className="text-base font-medium">Your balance</span>
      </div>

      <div className="relative mt-5 text-[44px] font-extrabold leading-none tracking-[-1.5px] md:text-[56px]">
        ₦
        <CountUp value={28891.138} format={(v) => v.toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} />
      </div>

      <p className="relative mt-4 flex items-center gap-1.5 text-small text-white/85">
        <ArrowUpRight className="h-4 w-4" />
        +12.4% vs last week
      </p>
    </motion.section>
  );
}

function RecentTable() {
  return (
    <motion.section
      {...fadeUp}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-panel border border-line bg-white p-6 shadow-glass md:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-card-title font-bold text-ink">Recent verifications</h2>
          <p className="text-small text-body">Latest activity from your live API</p>
        </div>
        <a
          href="/sandbox"
          className="inline-flex items-center gap-1.5 rounded-pill bg-subtle px-4 py-2 text-small font-medium text-brand-accent transition-colors hover:bg-brand/10"
        >
          Open sandbox
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-line text-left text-stat-label uppercase tracking-wide text-body">
              <th className="pb-3 font-medium">Reference</th>
              <th className="pb-3 font-medium">Type</th>
              <th className="pb-3 font-medium">Subject</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 text-right font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr
                key={r.ref}
                className="border-b border-line/70 last:border-0 transition-colors hover:bg-subtle/60"
              >
                <td className="py-4 font-mono text-small text-ink">{r.ref}</td>
                <td className="py-4">
                  <span className="inline-flex rounded-pill bg-subtle px-2.5 py-1 text-stat-label font-medium text-brand-accent">
                    {r.type}
                  </span>
                </td>
                <td className="py-4 font-mono text-small text-body">{r.subject}</td>
                <td className="py-4">
                  {r.ok ? (
                    <span className="inline-flex items-center gap-1.5 rounded-pill bg-success/10 px-2.5 py-1 text-stat-label font-medium text-success">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Success
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-pill bg-red-500/10 px-2.5 py-1 text-stat-label font-medium text-red-500">
                      <XCircle className="h-3.5 w-3.5" />
                      Failed
                    </span>
                  )}
                </td>
                <td className="py-4 text-right text-small text-body">{r.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}

/* ------------------------------------------------------------------ page */

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-[#fbfbfe]">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <div className="mx-auto max-w-[1200px] px-5 py-6 md:px-8">
          <Topbar />

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="mt-8"
          >
            <h1 className="text-[34px] font-extrabold tracking-[-1px] text-ink">
              Welcome back, <span className="text-gradient">emmmy</span>
            </h1>
            <p className="mt-1 text-lead text-body">
              Here&apos;s what&apos;s happening across your verifications today.
            </p>
          </motion.div>

          <div className="mt-8 flex flex-col gap-6">
            <BalanceCard />

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {STATS.map((stat, i) => (
                <StatCard key={stat.label} stat={stat} index={i} />
              ))}
            </div>

            <ActivityChart />
            <RecentTable />
          </div>
        </div>
      </div>
    </div>
  );
}
