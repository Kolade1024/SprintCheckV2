"use client";

import { Bell, Search } from "@/components/icons";

export default function Topbar() {
  return (
    <div className="flex items-center gap-3 md:gap-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-body" />
        <input
          type="search"
          placeholder="Search verifications, customers, requests…"
          aria-label="Search"
          className="h-12 w-full rounded-panel border border-line bg-white pl-12 pr-4 text-base text-ink shadow-card outline-none transition-colors placeholder:text-body/70 focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      {/* Notifications */}
      <button
        type="button"
        aria-label="Notifications"
        className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-panel border border-line bg-white text-body shadow-card transition-colors hover:bg-subtle hover:text-ink"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute right-3.5 top-3.5 h-2 w-2 rounded-full bg-brand ring-2 ring-white" />
      </button>

      {/* User chip */}
      <button
        type="button"
        className="flex h-12 shrink-0 items-center gap-2.5 rounded-panel border border-line bg-white pl-1.5 pr-3 shadow-card transition-colors hover:bg-subtle"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-pill bg-brand text-small font-bold text-offwhite">
          E
        </span>
        <span className="hidden flex-col items-start leading-tight md:flex">
          <span className="text-small font-semibold text-ink">emmmy</span>
          <span className="text-stat-label text-body">Live mode</span>
        </span>
      </button>
    </div>
  );
}
