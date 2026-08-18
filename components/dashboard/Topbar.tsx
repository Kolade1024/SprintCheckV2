"use client";

import GlobalSearch from "@/components/dashboard/GlobalSearch";
import MobileNav from "@/components/dashboard/MobileNav";
import NotificationsMenu from "@/components/dashboard/NotificationsMenu";
import UserMenu from "@/components/dashboard/UserMenu";

export default function Topbar() {
  return (
    <div className="flex items-center gap-3 md:gap-4">
      {/* Mobile / tablet nav trigger — the desktop sidebar is hidden below lg */}
      <MobileNav />

      {/* Global search */}
      <GlobalSearch />

      {/* Notifications */}
      <NotificationsMenu />

      {/* Account menu */}
      <UserMenu />
    </div>
  );
}
