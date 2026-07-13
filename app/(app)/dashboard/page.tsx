"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ComponentType } from "react";
import CountUp from "@/components/dashboard/CountUp";
import ActivityChart from "@/components/dashboard/ActivityChart";
import { EmptyState, ErrorState, LoadingState } from "@/components/dashboard/AsyncState";
import {
  ArrowUpRight,
  CheckCircle,
  FileCheck,
  Pulse,
  Wallet,
  XCircle,
  type IconProps,
} from "@/components/icons";
import { useAppData } from "@/lib/client/AppDataProvider";
import { appApi } from "@/lib/client/endpoints";
import { useApi } from "@/lib/client/useApi";
import type { ApiCallStats, VerificationLog } from "@/lib/shared/types";

/* ------------------------------------------------------------- animation */

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

/* ------------------------------------------------------------------ helpers */

type Stat = {
  icon: ComponentType<IconProps>;
  value: number;
  label: string;
  note?: string;
  progress: number;
  danger?: boolean;
};

function buildStats(calls: ApiCallStats, virtualAccounts: number): Stat[] {
  const total = calls.total || 0;
  const successRate = total > 0 ? Math.round((calls.successful / total) * 100) : 0;
  const failRate = total > 0 ? Math.round((calls.failed / total) * 100) : 0;
  return [
    { icon: Pulse, value: total, label: "Total API Calls", progress: 100 },
    {
      icon: CheckCircle,
      value: calls.successful || 0,
      label: "Successful verifications",
      note: `${successRate}% success rate`,
      progress: successRate,
    },
    {
      icon: XCircle,
      value: calls.failed || 0,
      label: "Failed verifications",
      note: `${failRate}% of calls`,
      progress: failRate,
      danger: true,
    },
    {
      icon: FileCheck,
      value: virtualAccounts,
      label: "Virtual accounts",
      progress: virtualAccounts > 0 ? 100 : 0,
    },
  ];
}

function relativeTime(iso: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(then).toLocaleDateString();
}

/* --------------------------------------------------------------- widgets */

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const { icon: Icon, value, label, note, progress, danger } = stat;
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
        {note && (
          <span className="inline-flex items-center gap-1 rounded-pill bg-subtle px-2.5 py-1 text-stat-label font-semibold text-body">
            {note}
          </span>
        )}
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
          whileInView={{ width: `${Math.min(progress, 100)}%` }}
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

function BalanceCard({ balance }: { balance: number }) {
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
        <CountUp
          value={balance}
          format={(v) =>
            v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          }
        />
      </div>

      <p className="relative mt-4 flex items-center gap-1.5 text-small text-white/85">
        <Wallet className="h-4 w-4" />
        Available to spend on verifications
      </p>
    </motion.section>
  );
}

function RecentTable({
  logs,
  loading,
  error,
  onRetry,
}: {
  logs: VerificationLog[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const rows = logs.slice(0, 5);
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
        <Link
          href="/history"
          className="inline-flex items-center gap-1.5 rounded-pill bg-subtle px-4 py-2 text-small font-medium text-brand-accent transition-colors hover:bg-brand/10"
        >
          View all
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {loading ? (
        <LoadingState label="Loading recent activity…" />
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : rows.length === 0 ? (
        <EmptyState message="No verifications yet. Your live activity will appear here." />
      ) : (
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
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-line/70 last:border-0 transition-colors hover:bg-subtle/60"
                >
                  <td className="py-4 font-mono text-small text-ink">
                    {String(r.id).slice(0, 10)}
                  </td>
                  <td className="py-4">
                    <span className="inline-flex rounded-pill bg-subtle px-2.5 py-1 text-stat-label font-medium text-brand-accent">
                      {r.endpoint}
                    </span>
                  </td>
                  <td className="py-4 font-mono text-small text-body">{r.name || "—"}</td>
                  <td className="py-4">
                    {r.status === "successful" ? (
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
                  <td className="py-4 text-right text-small text-body">
                    {relativeTime(r.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.section>
  );
}

/* ------------------------------------------------------------------ page */

export default function DashboardPage() {
  const { summary, loading, error, refresh } = useAppData();
  const history = useApi((signal) => appApi.history(signal));

  if (loading && !summary) {
    return (
      <div className="mt-8 rounded-panel border border-line bg-white p-6 shadow-glass">
        <LoadingState label="Loading your dashboard…" />
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="mt-8 rounded-panel border border-line bg-white p-6 shadow-glass">
        <ErrorState message={error} onRetry={refresh} />
      </div>
    );
  }

  const calls = summary?.api_calls ?? { total: 0, successful: 0, failed: 0 };
  const stats = buildStats(calls, summary?.virtual_accounts?.length ?? 0);
  const firstName = summary?.user?.name?.split(" ")[0] ?? "there";

  return (
    <>
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="mt-8"
      >
        <h1 className="text-[34px] font-extrabold tracking-[-1px] text-ink">
          Welcome back, <span className="text-gradient">{firstName}</span>
        </h1>
        <p className="mt-1 text-lead text-body">
          Here&apos;s what&apos;s happening across your verifications today.
        </p>
      </motion.div>

      <div className="mt-8 flex flex-col gap-6">
        <BalanceCard balance={summary?.wallet_balance ?? 0} />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>

        <ActivityChart
          logs={history.data ?? []}
          loading={history.loading}
          error={history.error}
          onRetry={history.refetch}
        />
        <RecentTable
          logs={history.data ?? []}
          loading={history.loading}
          error={history.error}
          onRetry={history.refetch}
        />
      </div>
    </>
  );
}
