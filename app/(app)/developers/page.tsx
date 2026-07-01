"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import {
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  RefreshCw,
} from "@/components/icons";

/* ------------------------------------------------------------------ data */

const KEYS = {
  clientId: "6",
  encryptionKey: "enc_8f3a9c2b6d1e4f7a0b5c8d2e9f1a3b6c",
  apiKey: "live_2b4c6d8e0f1a3b5c7d9e1f3a5b7c9d1e",
  testApiKey: "test_scbgsWD87NtxiMeTBC0L8j7cs0zxFERibGEh",
  webhookUrl: "https://github.com/5Star-Inn-Company-Frontend/Sprint-Check",
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

/* --------------------------------------------------------------- widgets */

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* clipboard unavailable — no-op */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      className="flex h-8 w-8 items-center justify-center rounded-btn text-brand-accent transition-colors hover:bg-brand/10"
    >
      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

function KeyField({
  label,
  value,
  secret = false,
  copyable = true,
  readOnly = true,
  muted = false,
}: {
  label: string;
  value: string;
  secret?: boolean;
  copyable?: boolean;
  readOnly?: boolean;
  muted?: boolean;
}) {
  const [revealed, setRevealed] = useState(true);
  const display = secret && !revealed ? "•".repeat(Math.min(value.length, 36)) : value;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-base font-medium text-ink">{label}</label>
      <div
        className={`flex items-center gap-2 rounded-btn border border-line px-4 ${
          muted ? "bg-subtle" : "bg-white"
        }`}
      >
        <input
          readOnly={readOnly}
          aria-label={label}
          {...(readOnly ? { value: display } : { defaultValue: value })}
          className="min-w-0 flex-1 truncate bg-transparent py-3.5 font-mono text-base text-ink outline-none"
        />
        {secret && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? `Hide ${label}` : `Show ${label}`}
            className="flex h-8 w-8 items-center justify-center rounded-btn text-brand-accent transition-colors hover:bg-brand/10"
          >
            {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
        {copyable && <CopyButton value={value} />}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ page */

export default function DevelopersPage() {
  return (
    <div className="flex min-h-screen bg-[#fbfbfe]">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1200px] px-5 py-6 md:px-8">
          <Topbar />

          {/* Header */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="mt-8 flex flex-wrap items-start justify-between gap-4"
          >
            <div>
              <h1 className="text-[34px] font-extrabold tracking-[-1px] text-gradient">
                Developers
              </h1>
              <p className="mt-1 text-lead text-body">
                Manage your API keys, encryption settings, and webhooks.
              </p>
            </div>

            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-base font-medium text-brand-accent transition-colors hover:text-brand"
            >
              Visit Documentation Page
              <ExternalLink className="h-4 w-4" />
            </a>
          </motion.div>

          {/* API card */}
          <motion.section
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.4, 0, 0.2, 1] }}
            className="mt-8 rounded-panel border border-line bg-white p-6 shadow-glass md:p-8"
          >
            <h2 className="text-card-title font-bold text-ink">API</h2>

            <div className="mx-auto mt-6 flex max-w-[760px] flex-col gap-6">
              <KeyField label="Client ID" value={KEYS.clientId} copyable={false} muted />
              <KeyField label="Encryption Key" value={KEYS.encryptionKey} secret />
              <KeyField label="API Key" value={KEYS.apiKey} secret />
              <KeyField label="Test Api Key" value={KEYS.testApiKey} />

              <div className="flex justify-end">
                <button
                  type="button"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-btn bg-brand px-6 text-base font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px"
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerate Keys
                </button>
              </div>
            </div>
          </motion.section>

          {/* Webhook card */}
          <motion.section
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.16, ease: [0.4, 0, 0.2, 1] }}
            className="mt-6 rounded-panel border border-line bg-white p-6 shadow-glass md:p-8"
          >
            <h2 className="text-card-title font-bold text-ink">Webhook</h2>

            <div className="mx-auto mt-6 flex max-w-[760px] flex-col gap-6">
              <KeyField label="Webhook URL" value={KEYS.webhookUrl} readOnly={false} />

              <div className="flex justify-end">
                <button
                  type="button"
                  className="inline-flex h-12 items-center justify-center rounded-btn bg-brand px-7 text-base font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px"
                >
                  Save
                </button>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
