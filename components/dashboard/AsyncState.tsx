"use client";

import { AlertTriangle, RefreshCw } from "@/components/icons";

/**
 * Shared loading / error / empty blocks used inside dashboard panels so all
 * async states look identical across pages.
 */

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14" role="status">
      <span className="h-8 w-8 animate-spin rounded-pill border-[3px] border-line border-t-brand" />
      <span className="text-small text-body">{label}</span>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center" role="alert">
      <span className="flex h-11 w-11 items-center justify-center rounded-pill bg-red-50 text-red-500">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <p className="max-w-[420px] text-small text-body">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-btn bg-subtle px-4 text-small font-medium text-brand-accent transition-colors hover:bg-brand/10"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      <p className="max-w-[420px] text-small text-body">{message}</p>
    </div>
  );
}
