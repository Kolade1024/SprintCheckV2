"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { X } from "@/components/icons";

/**
 * Shared record-detail modal used by the History, Billing, and Audit Log
 * pages: a centered card over a blurred backdrop containing stacked
 * <DetailCard> groups of <DetailRow label/value> lines.
 *
 * Render inside <AnimatePresence> so the exit animation plays.
 */

export function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-3">
      <span className="shrink-0 text-small text-body">{label}</span>
      <span className="min-w-0 break-words text-right text-small font-semibold text-ink">
        {value}
      </span>
    </div>
  );
}

export function DetailCard({ children }: { children: ReactNode }) {
  return (
    <div className="divide-y divide-line/60 rounded-2xl border border-line bg-subtle/50">
      {children}
    </div>
  );
}

export default function DetailModal({
  ariaLabel,
  onClose,
  children,
}: {
  ariaLabel: string;
  onClose: () => void;
  children: ReactNode;
}) {
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
        aria-label={ariaLabel}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="relative max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-hero bg-white p-7 shadow-glass"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-btn text-body transition-colors hover:bg-black/5 hover:text-ink"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mt-6 flex flex-col gap-4">{children}</div>
      </motion.div>
    </div>
  );
}
