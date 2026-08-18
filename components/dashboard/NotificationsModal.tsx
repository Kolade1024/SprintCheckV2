"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "@/components/icons";
import NotificationItem from "@/components/dashboard/NotificationItem";
import { appApi } from "@/lib/client/endpoints";
import type { AppNotification } from "@/lib/shared/types";

const TABS = ["All", "Unread"] as const;
type Tab = (typeof TABS)[number];

/**
 * Full notification history. The topbar panel only previews the newest few;
 * this loads the paginated list a page at a time and can filter to unread.
 */
export default function NotificationsModal({
  onClose,
  onChanged,
}: {
  onClose: () => void;
  /** Fires after a read/read-all so the topbar's unread badge refreshes. */
  onChanged: () => void;
}) {
  const [tab, setTab] = useState<Tab>("All");
  const [items, setItems] = useState<AppNotification[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError(null);
    appApi
      .notifications(page, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        // Page 1 replaces; later pages append (the "Load more" path).
        setItems((current) =>
          page === 1 ? result.items : [...current, ...result.items],
        );
        setLastPage(result.meta.lastPage);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Could not load notifications.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [page]);

  const visible = useMemo(
    () => (tab === "Unread" ? items.filter((n) => !n.read) : items),
    [items, tab],
  );
  const hasUnread = items.some((n) => !n.read);

  async function markAllRead() {
    setMarking(true);
    try {
      await appApi.markAllNotificationsRead();
      const now = new Date().toISOString();
      setItems((current) => current.map((n) => ({ ...n, read: true, readAt: n.readAt ?? now })));
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mark notifications as read.");
    } finally {
      setMarking(false);
    }
  }

  async function markOneRead(notification: AppNotification) {
    if (notification.read) return;
    const now = new Date().toISOString();
    setItems((current) =>
      current.map((n) => (n.id === notification.id ? { ...n, read: true, readAt: now } : n)),
    );
    try {
      await appApi.markNotificationsRead([notification.id]);
      onChanged();
    } catch {
      // Non-blocking: the row stays optimistically read until the next load.
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
        aria-label="Notifications"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="relative flex max-h-[80vh] w-full max-w-[520px] flex-col overflow-hidden rounded-hero bg-white shadow-glass"
      >
        <div className="flex items-center justify-between gap-3 px-6 pb-4 pt-6">
          <h2 className="text-card-title font-bold text-ink">Notifications</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-btn text-body transition-colors hover:bg-black/5 hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-4">
          <div className="inline-flex rounded-pill border border-line bg-subtle p-1">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-pill px-4 py-1.5 text-small font-medium transition-colors ${
                  tab === t ? "bg-white text-ink shadow-card" : "text-body hover:text-ink"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {hasUnread && (
            <button
              type="button"
              onClick={markAllRead}
              disabled={marking}
              className="inline-flex items-center gap-1.5 text-small font-medium text-brand-accent transition-colors hover:text-brand disabled:opacity-60"
            >
              <Check className="h-3.5 w-3.5" />
              {marking ? "Marking…" : "Mark all as read"}
            </button>
          )}
        </div>

        <div className="no-scrollbar min-h-[220px] flex-1 overflow-y-auto border-t border-line">
          {loading && items.length === 0 ? (
            <p className="px-6 py-16 text-center text-small text-body">Loading…</p>
          ) : error ? (
            <p role="alert" className="px-6 py-16 text-center text-small text-red-600">
              {error}
            </p>
          ) : visible.length === 0 ? (
            <p className="px-6 py-16 text-center text-small text-body">
              {tab === "Unread"
                ? "No unread notifications."
                : "You have no notifications yet."}
            </p>
          ) : (
            <>
              {visible.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={markOneRead}
                />
              ))}
              {page < lastPage && (
                <div className="p-4 text-center">
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={loading}
                    className="inline-flex h-10 items-center justify-center rounded-btn bg-subtle px-5 text-small font-medium text-brand-accent transition-colors hover:bg-brand/10 disabled:opacity-60"
                  >
                    {loading ? "Loading…" : "Load older"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
