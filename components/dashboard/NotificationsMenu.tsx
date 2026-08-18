"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "@/components/icons";
import NotificationItem from "@/components/dashboard/NotificationItem";
import NotificationsModal from "@/components/dashboard/NotificationsModal";
import { appApi } from "@/lib/client/endpoints";
import { useAppData } from "@/lib/client/AppDataProvider";
import { useEdgeClamp } from "@/lib/client/useEdgeClamp";
import type { AppNotification } from "@/lib/shared/types";

/** The panel is a preview — the full history lives in the modal. */
const PREVIEW_COUNT = 3;

/**
 * Topbar bell. The unread count comes from the shared /account payload; the
 * newest few notifications are only fetched when the panel is opened, so the
 * dashboard load doesn't pay for them.
 */
export default function NotificationsMenu() {
  const { account, refresh } = useAppData();
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // On phones the bell sits too close to the right edge for a right-anchored
  // panel to fit; this nudges it back inside the viewport.
  const edgeShift = useEdgeClamp(open, containerRef, panelRef);

  const unread = account?.unreadNotifications ?? 0;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();

    setLoading(true);
    setError(null);
    appApi
      .notifications(1, controller.signal)
      .then((page) => {
        if (controller.signal.aborted) return;
        setItems(page.items);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Could not load notifications.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [open]);

  async function markOneRead(notification: AppNotification) {
    if (notification.read) return;
    const now = new Date().toISOString();
    setItems((current) =>
      current?.map((n) => (n.id === notification.id ? { ...n, read: true, readAt: now } : n)) ??
      current,
    );
    try {
      await appApi.markNotificationsRead([notification.id]);
      refresh();
    } catch {
      // Non-blocking: the row stays optimistically read until the next load.
    }
  }

  const preview = items?.slice(0, PREVIEW_COUNT) ?? [];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={unread > 0 ? `Notifications (${unread} unread)` : "Notifications"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-panel border border-line bg-white text-body shadow-card transition-colors hover:bg-subtle hover:text-ink"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-2 top-2 flex min-w-[18px] items-center justify-center rounded-pill bg-brand px-1 text-[10px] font-bold leading-[18px] text-offwhite ring-2 ring-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            role="dialog"
            aria-label="Recent notifications"
            style={{ right: -edgeShift }}
            className="absolute z-50 mt-2 w-[min(320px,calc(100vw-1.5rem))] overflow-hidden rounded-panel border border-line bg-white shadow-glass"
          >
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <h3 className="text-small font-bold text-ink">Notifications</h3>
              {unread > 0 && (
                <span className="rounded-pill bg-brand/10 px-2 py-0.5 text-stat-label font-semibold text-brand-accent">
                  {unread} new
                </span>
              )}
            </div>

            <div>
              {loading ? (
                <p className="px-4 py-8 text-center text-small text-body">Loading…</p>
              ) : error ? (
                <p role="alert" className="px-4 py-8 text-center text-small text-red-600">
                  {error}
                </p>
              ) : preview.length === 0 ? (
                <p className="px-4 py-8 text-center text-small text-body">
                  You&apos;re all caught up.
                </p>
              ) : (
                preview.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={markOneRead}
                    compact
                  />
                ))
              )}
            </div>

            <div className="border-t border-line p-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setModalOpen(true);
                }}
                className="flex h-10 w-full items-center justify-center rounded-btn text-small font-medium text-brand-accent transition-colors hover:bg-brand/10"
              >
                View all notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalOpen && (
          <NotificationsModal onClose={() => setModalOpen(false)} onChanged={refresh} />
        )}
      </AnimatePresence>
    </div>
  );
}
