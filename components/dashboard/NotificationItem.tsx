"use client";

import type { AppNotification } from "@/lib/shared/types";

/** Relative time for recent items, falling back to a date after a week. */
export function formatNotificationTime(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)}h ago`;
  if (minutes < 60 * 24 * 7) return `${Math.round(minutes / (60 * 24))}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** One notification row, shared by the topbar panel and the full modal. */
export default function NotificationItem({
  notification,
  onRead,
  compact = false,
}: {
  notification: AppNotification;
  onRead: (notification: AppNotification) => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onRead(notification)}
      className={`flex w-full items-start gap-3 border-b border-line/70 text-left transition-colors last:border-0 hover:bg-subtle/60 ${
        compact ? "px-4 py-3" : "px-5 py-4"
      } ${notification.read ? "" : "bg-brand/[0.04]"}`}
    >
      <span
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
          notification.read ? "bg-line" : "bg-brand"
        }`}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-small font-semibold text-ink">
          {notification.title}
        </span>
        <span
          className={`mt-0.5 block text-stat-label leading-relaxed text-body ${
            compact ? "line-clamp-2" : ""
          }`}
        >
          {notification.body}
        </span>
        <span className="mt-1 block text-stat-label text-body/70">
          {formatNotificationTime(notification.createdAt)}
        </span>
      </span>
    </button>
  );
}
