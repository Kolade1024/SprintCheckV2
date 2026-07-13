"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  RefreshCw,
} from "@/components/icons";
import { ErrorState, LoadingState } from "@/components/dashboard/AsyncState";
import { useAppData } from "@/lib/client/AppDataProvider";
import { appApi } from "@/lib/client/endpoints";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

type Keys = {
  clientId: string;
  encryptionKey: string;
  apiKey: string;
  testApiKey: string;
};

type Notice = { kind: "success" | "error"; message: string };

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
  muted = false,
}: {
  label: string;
  value: string;
  secret?: boolean;
  copyable?: boolean;
  muted?: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  const display = secret && !revealed ? "•".repeat(Math.min(value.length || 24, 36)) : value;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-base font-medium text-ink">{label}</label>
      <div
        className={`flex items-center gap-2 rounded-btn border border-line px-4 ${
          muted ? "bg-subtle" : "bg-white"
        }`}
      >
        <input
          readOnly
          aria-label={label}
          value={display}
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

function NoticeBanner({ notice }: { notice: Notice }) {
  return (
    <p
      role="status"
      className={`text-small font-medium ${
        notice.kind === "success" ? "text-success" : "text-red-600"
      }`}
    >
      {notice.message}
    </p>
  );
}

/* ------------------------------------------------------------------ page */

export default function DevelopersPage() {
  const { summary, loading, error, refresh } = useAppData();
  const business = summary?.user?.business;

  const [keys, setKeys] = useState<Keys | null>(null);
  const [webhook, setWebhook] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  // Seed local state from the shared dashboard summary once it loads.
  useEffect(() => {
    if (!business) return;
    setKeys({
      clientId: String(business.id ?? ""),
      encryptionKey: business.encryption_key ?? "",
      apiKey: business.api_key ?? "",
      testApiKey: business.test_api_key ?? "",
    });
    setWebhook(business.webhook_url ?? "");
  }, [business]);

  async function regenerate() {
    setRegenerating(true);
    setNotice(null);
    try {
      const res = await appApi.regenerateKeys();
      setKeys((prev) => ({
        clientId: String(res.id ?? prev?.clientId ?? ""),
        encryptionKey: res.encryption_key,
        apiKey: res.api_key,
        testApiKey: res.test_api_key,
      }));
      setNotice({ kind: "success", message: "Keys regenerated successfully." });
      refresh();
    } catch (err) {
      setNotice({
        kind: "error",
        message: err instanceof Error ? err.message : "Could not regenerate keys.",
      });
    } finally {
      setRegenerating(false);
    }
  }

  async function saveWebhook() {
    setSavingWebhook(true);
    setNotice(null);
    try {
      const res = await appApi.updateWebhook(webhook);
      setNotice({ kind: "success", message: res.message ?? "Webhook saved." });
    } catch (err) {
      setNotice({
        kind: "error",
        message: err instanceof Error ? err.message : "Could not save webhook.",
      });
    } finally {
      setSavingWebhook(false);
    }
  }

  return (
    <>
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
          href="/sandbox"
          className="inline-flex items-center gap-1.5 text-base font-medium text-brand-accent transition-colors hover:text-brand"
        >
          Visit Documentation Page
          <ExternalLink className="h-4 w-4" />
        </a>
      </motion.div>

      {loading && !keys ? (
        <div className="mt-8 rounded-panel border border-line bg-white p-6 shadow-glass md:p-8">
          <LoadingState label="Loading your API credentials…" />
        </div>
      ) : error && !keys ? (
        <div className="mt-8 rounded-panel border border-line bg-white p-6 shadow-glass md:p-8">
          <ErrorState message={error} onRetry={refresh} />
        </div>
      ) : (
        <>
          {/* API card */}
          <motion.section
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.4, 0, 0.2, 1] }}
            className="mt-8 rounded-panel border border-line bg-white p-6 shadow-glass md:p-8"
          >
            <h2 className="text-card-title font-bold text-ink">API</h2>

            <div className="mx-auto mt-6 flex max-w-[760px] flex-col gap-6">
              <KeyField label="Client ID" value={keys?.clientId ?? ""} copyable={false} muted />
              <KeyField label="Encryption Key" value={keys?.encryptionKey ?? ""} secret />
              <KeyField label="API Key" value={keys?.apiKey ?? ""} secret />
              <KeyField label="Test Api Key" value={keys?.testApiKey ?? ""} />

              {notice && <NoticeBanner notice={notice} />}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={regenerate}
                  disabled={regenerating}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-btn bg-brand px-6 text-base font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <RefreshCw className={`h-4 w-4 ${regenerating ? "animate-spin" : ""}`} />
                  {regenerating ? "Regenerating…" : "Regenerate Keys"}
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
              <div className="flex flex-col gap-2">
                <label htmlFor="webhook-url" className="text-base font-medium text-ink">
                  Webhook URL
                </label>
                <input
                  id="webhook-url"
                  type="url"
                  inputMode="url"
                  value={webhook}
                  onChange={(e) => setWebhook(e.target.value)}
                  placeholder="https://your-server.com/webhook"
                  className="rounded-btn border border-line bg-white px-4 py-3.5 font-mono text-base text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={saveWebhook}
                  disabled={savingWebhook}
                  className="inline-flex h-12 items-center justify-center rounded-btn bg-brand px-7 text-base font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingWebhook ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </motion.section>
        </>
      )}
    </>
  );
}
