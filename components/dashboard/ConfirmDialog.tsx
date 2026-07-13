"use client";

import type { ComponentType } from "react";
import { motion } from "framer-motion";
import type { IconProps } from "@/components/icons";

/**
 * Confirmation modal for destructive or important actions (sign out, delete,
 * regenerate keys). Render inside <AnimatePresence> so exit animations play.
 */
export default function ConfirmDialog({
  tone = "default",
  icon: Icon,
  title,
  description,
  confirmLabel,
  loadingLabel = "Working…",
  cancelLabel = "Cancel",
  loading = false,
  error = null,
  onConfirm,
  onCancel,
}: {
  tone?: "default" | "danger";
  icon: ComponentType<IconProps>;
  title: string;
  description: string;
  confirmLabel: string;
  loadingLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const danger = tone === "danger";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={loading ? undefined : onCancel}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />
      <motion.div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full max-w-[440px] rounded-hero bg-white p-7 shadow-glass"
      >
        <div className="flex items-start gap-4">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-card ${
              danger ? "bg-red-50 text-red-500" : "bg-subtle text-brand"
            }`}
          >
            <Icon className="h-6 w-6" />
          </span>
          <div>
            <h3 className="text-card-title font-bold text-ink">{title}</h3>
            <p className="mt-1 text-small text-body">{description}</p>
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 text-small font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-btn bg-subtle px-5 text-base font-medium text-ink transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex h-11 items-center justify-center rounded-btn px-5 text-base font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
              danger ? "bg-red-500 shadow-btn hover:bg-red-600" : "bg-brand shadow-glow hover:-translate-y-px"
            }`}
          >
            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
