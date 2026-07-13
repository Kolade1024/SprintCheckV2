"use client";

import { Bell } from "@/components/icons";
import GlobalSearch from "@/components/dashboard/GlobalSearch";
import MobileNav from "@/components/dashboard/MobileNav";
import UserMenu from "@/components/dashboard/UserMenu";

export default function Topbar() {
  return (
    <div className="flex items-center gap-3 md:gap-4">
      {/* Mobile / tablet nav trigger — the desktop sidebar is hidden below lg */}
      <MobileNav />

      {/* Global search */}
      <GlobalSearch />

      {/* Notifications */}
      <button
        type="button"
        aria-label="Notifications"
        className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-panel border border-line bg-white text-body shadow-card transition-colors hover:bg-subtle hover:text-ink"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute right-3.5 top-3.5 h-2 w-2 rounded-full bg-brand ring-2 ring-white" />
      </button>

      {/* Account menu */}
      <UserMenu />
    </div>
  );
}
