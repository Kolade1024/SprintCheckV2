"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EmptyState, ErrorState, LoadingState } from "@/components/dashboard/AsyncState";
import DetailModal, { DetailCard, DetailRow } from "@/components/dashboard/DetailModal";
import TopUpModal from "@/components/dashboard/TopUpModal";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "@/components/icons";
import { useAppData } from "@/lib/client/AppDataProvider";
import { appApi } from "@/lib/client/endpoints";
import { useApi } from "@/lib/client/useApi";
import type { WalletTransaction } from "@/lib/shared/types";

/* ------------------------------------------------------------------ config */

const PAGE_SIZE = 8;
const TABS = ["All", "Credit", "Debit"] as const;

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const naira = (n: number) => `₦${Math.abs(n).toLocaleString("en-US")}`;

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });
}

/* --------------------------------------------------------------- widgets */

function TypePill({ kind }: { kind: WalletTransaction["kind"] }) {
  return (
    <span
      className={`inline-flex rounded-pill px-2.5 py-1 text-stat-label font-medium ${
        kind === "Credit" ? "bg-success/10 text-success" : "bg-subtle text-brand-accent"
      }`}
    >
      {kind}
    </span>
  );
}

/* --------------------------------------------------------------- detail modal */

function TransactionDetailModal({
  txn,
  onClose,
}: {
  txn: WalletTransaction;
  onClose: () => void;
}) {
  const credit = txn.kind === "Credit";
  return (
    <DetailModal ariaLabel={`Transaction ${txn.id}`} onClose={onClose}>
      <DetailCard>
        <DetailRow
          label="Transaction ID"
          value={<span className="font-mono">{String(txn.id)}</span>}
        />
        <DetailRow label="Type" value={<TypePill kind={txn.kind} />} />
        <DetailRow
          label="Amount"
          value={
            <span className={credit ? "text-success" : "text-red-500"}>
              {credit ? "+" : "-"}
              {naira(txn.amount)}
            </span>
          }
        />
      </DetailCard>

      <DetailCard>
        <DetailRow label="Description" value={txn.description || "—"} />
        <DetailRow label="Date" value={formatDate(txn.createdAt)} />
      </DetailCard>

      <DetailCard>
        <DetailRow
          label="Balance before"
          value={txn.balanceBefore === null ? "—" : naira(txn.balanceBefore)}
        />
        <DetailRow
          label="Balance after"
          value={txn.balanceAfter === null ? "—" : naira(txn.balanceAfter)}
        />
      </DetailCard>
    </DetailModal>
  );
}

/* ------------------------------------------------------------------ page */

export default function BillingPage() {
  const { summary } = useAppData();
  const { data, loading, error, refetch } = useApi((signal) => appApi.walletHistory(signal));
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [page, setPage] = useState(1);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [selected, setSelected] = useState<WalletTransaction | null>(null);

  const txns = useMemo(() => data ?? [], [data]);

  const totals = useMemo(() => {
    let spend = 0;
    let topUps = 0;
    for (const t of txns) {
      if (t.kind === "Credit") topUps += Math.abs(t.amount);
      else spend += Math.abs(t.amount);
    }
    return { spend, topUps };
  }, [txns]);

  const filtered = useMemo(() => {
    if (tab === "All") return txns;
    return txns.filter((t) => t.kind === tab);
  }, [txns, tab]);

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
        <h1 className="text-[34px] font-extrabold tracking-[-1px] text-gradient">Billing</h1>
        <p className="mt-1 text-lead text-body">
          Track your wallet balance and every transaction on your account.
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
                ₦{(summary?.wallet_balance ?? 0).toLocaleString("en-US")}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setTopUpOpen(true)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-btn bg-brand px-6 text-base font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px"
            >
              <Plus className="h-4 w-4" />
              Top up
            </button>
          </div>
        </motion.section>

        {/* Total spend */}
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
              {naira(totals.spend)}
            </span>
            <span className="mt-1 text-base font-medium text-ink">Total spend</span>
            <span className="text-small text-body">Across all debits</span>
          </div>
        </motion.div>

        {/* Total top-ups */}
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
              {naira(totals.topUps)}
            </span>
            <span className="mt-1 text-base font-medium text-ink">Total credits</span>
            <span className="text-small text-body">All wallet top-ups</span>
          </div>
        </motion.div>
      </div>

      {/* Transactions */}
      <motion.section
        {...fadeUp}
        transition={{ duration: 0.5, delay: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="mt-6 rounded-panel border border-line bg-white p-6 shadow-glass md:p-7"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-card-title font-bold text-ink">Transactions</h2>
            <p className="text-small text-body">Every movement on your wallet.</p>
          </div>

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
        </div>

        {loading ? (
          <LoadingState label="Loading transactions…" />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : txns.length === 0 ? (
          <EmptyState message="No transactions yet. Wallet activity will show up here." />
        ) : (
          <>
            <div className="mt-6 overflow-x-auto">
              {/* white-space is inherited, so nowrap on the table covers every cell */}
              <table className="w-full min-w-[880px] border-collapse whitespace-nowrap">
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
                    return (
                      <tr
                        key={t.id}
                        onClick={() => setSelected(t)}
                        className="cursor-pointer border-b border-line/70 last:border-0 transition-colors hover:bg-subtle/50"
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
                            <div className="min-w-0">
                              <div
                                title={t.description}
                                className="max-w-[280px] truncate text-base font-semibold text-ink"
                              >
                                {t.description}
                              </div>
                              <div className="text-stat-label text-body">{t.kind}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4 font-mono text-small text-body">{t.id}</td>
                        <td className="py-4 pr-4">
                          <TypePill kind={t.kind} />
                        </td>
                        <td className="py-4 pr-4 text-small text-body">{formatDate(t.createdAt)}</td>
                        <td
                          className={`py-4 pr-4 text-right text-small font-semibold ${
                            credit ? "text-success" : "text-red-500"
                          }`}
                        >
                          {credit ? "+" : "-"}
                          {naira(t.amount)}
                        </td>
                        <td className="py-4 pr-4 text-right text-small text-body">
                          {t.balanceBefore === null ? "—" : naira(t.balanceBefore)}
                        </td>
                        <td className="py-4 text-right text-small font-medium text-ink">
                          {t.balanceAfter === null ? "—" : naira(t.balanceAfter)}
                        </td>
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
                of <span className="font-semibold text-ink">{filtered.length}</span> transactions
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
        {topUpOpen && (
          <TopUpModal
            accounts={summary?.virtual_accounts ?? []}
            onClose={() => setTopUpOpen(false)}
          />
        )}
        {selected && (
          <TransactionDetailModal txn={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
