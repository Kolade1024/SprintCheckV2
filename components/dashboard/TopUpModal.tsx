"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { appApi } from "@/lib/client/endpoints";
import { useAppData } from "@/lib/client/AppDataProvider";
import { AlertTriangle, Check, Copy, CreditCard, Wallet, X } from "@/components/icons";
import type { VirtualAccount } from "@/lib/shared/types";

/**
 * Wallet top-up flow. Merchants fund their wallet by bank transfer to a
 * dedicated virtual account; if none exists yet, one is generated from the
 * merchant's BVN via POST /generate-account.
 */
export default function TopUpModal({
  accounts,
  onClose,
}: {
  accounts: VirtualAccount[];
  onClose: () => void;
}) {
  const { refresh } = useAppData();
  const [generated, setGenerated] = useState<VirtualAccount | null>(null);
  const [bvn, setBvn] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const allAccounts = generated ? [generated, ...accounts] : accounts;

  async function copyValue(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  async function generate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    try {
      const account = await appApi.generateAccount(bvn);
      setGenerated(account);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate an account.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Top up your wallet"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full max-w-[520px] rounded-hero bg-white p-8 shadow-glass"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-btn text-body transition-colors hover:bg-black/5 hover:text-ink"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-brand text-offwhite shadow-glow">
            <Wallet className="h-6 w-6" />
          </span>
          <div>
            <h3 className="text-card-title font-bold text-ink">Top up your wallet</h3>
            <p className="text-small text-body">
              Transfer to your dedicated account — funds reflect automatically.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-line bg-subtle px-4 py-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-star" />
          <p className="text-small text-body">
            A <span className="font-semibold text-ink">₦80 funding fee</span> applies to each
            top-up.
          </p>
        </div>

        {allAccounts.length > 0 ? (
          <div className="mt-6 flex flex-col gap-4">
            {allAccounts.map((account) => (
              <div
                key={account.account_number}
                className="rounded-2xl border border-line bg-subtle p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-stat-label font-semibold uppercase tracking-wide text-body">
                      {account.bank_name}
                    </div>
                    <div className="mt-1 font-mono text-[26px] font-bold tracking-wide text-ink">
                      {account.account_number}
                    </div>
                    {account.customer_name && (
                      <div className="mt-0.5 text-small text-body">{account.customer_name}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => copyValue(account.account_number)}
                    aria-label="Copy account number"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-white text-brand-accent shadow-card transition-colors hover:bg-brand/10"
                  >
                    {copied === account.account_number ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
            <p className="text-center text-stat-label text-body">
              Transfers usually reflect within a minute. Refresh the page if your
              balance doesn&apos;t update.
            </p>
          </div>
        ) : (
          <form onSubmit={generate} className="mt-6 flex flex-col gap-4">
            <p className="text-small text-body">
              You don&apos;t have a virtual account yet. Enter your BVN to generate a
              dedicated account for wallet top-ups.
            </p>
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-subtle px-4 transition-colors focus-within:border-brand focus-within:bg-white">
              <CreditCard className="h-5 w-5 shrink-0 text-body" />
              <input
                value={bvn}
                onChange={(e) => setBvn(e.target.value.replace(/\D/g, "").slice(0, 11))}
                inputMode="numeric"
                placeholder="Your 11-digit BVN"
                aria-label="BVN"
                className="h-14 min-w-0 flex-1 bg-transparent font-mono text-base text-ink outline-none placeholder:font-sans placeholder:text-body/60"
              />
            </div>

            {error && (
              <p role="alert" className="text-small font-medium text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={generating || bvn.length !== 11}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-btn bg-brand px-6 text-base font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {generating ? "Generating account…" : "Generate account"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
