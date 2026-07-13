"use client";

import { useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useLogout } from "@/lib/client/useLogout";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CodeBrackets,
  History,
  LayoutGrid,
  LogOut,
  Receipt,
  ShieldCheck,
  Tag,
  User,
  type IconProps,
} from "@/components/icons";

export type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<IconProps>;
};

/** Primary nav — shared with the mobile drawer (MobileNav). */
export const PRIMARY_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Verification", href: "/verification", icon: ShieldCheck },
  { label: "History", href: "/history", icon: History },
  { label: "Billing", href: "/billing", icon: Receipt },
  { label: "Developers", href: "/developers", icon: CodeBrackets },
  { label: "Pricing", href: "/pricing", icon: Tag },
  { label: "Audit Log", href: "/audit-log", icon: ClipboardList },
];

export const PROFILE_NAV: NavItem = { label: "Profile", href: "/profile", icon: User };

const STORAGE_KEY = "sc-sidebar-collapsed";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [animate, setAnimate] = useState(false);
  const {
    confirming: confirmingLogout,
    loggingOut,
    error: logoutError,
    logout,
    requestLogout,
    cancel: cancelLogout,
  } = useLogout();

  // Restore persisted state without animating on first paint.
  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  function NavLink({ label, href, icon: Icon }: NavItem) {
    const active = isActive(href);
    return (
      <Link
        href={href}
        title={collapsed ? label : undefined}
        aria-current={active ? "page" : undefined}
        className={`group flex items-center gap-3 rounded-btn py-2.5 text-base font-medium transition-colors ${collapsed ? "justify-center px-0" : "px-3"
          } ${active
            ? "bg-brand text-offwhite shadow-glow"
            : "text-body hover:bg-subtle hover:text-ink"
          }`}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span className="flex-1 truncate">{label}</span>}
        {!collapsed && active && <ChevronRight className="h-4 w-4 shrink-0" />}
      </Link>
    );
  }

  return (
    <>
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-white p-5 lg:flex ${collapsed ? "w-[84px]" : "w-[272px]"
          } ${animate ? "transition-[width] duration-300 ease-smooth" : ""}`}
      >
        {/* Collapse toggle on the sidebar edge */}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className="absolute -right-3 top-8 z-20 flex h-6 w-6 items-center justify-center rounded-pill border border-line bg-white text-body shadow-card transition-colors hover:bg-subtle hover:text-ink"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>

        {/* Logo */}
        <a
          href="/"
          className={`mb-8 flex items-center gap-2.5 ${collapsed ? "justify-center px-0" : "px-2"}`}
          aria-label="SprintCheck home"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-card bg-transparent shadow-glow">
            <img
              src="/icon_app.png"
              alt="SprintCheck Logo Icon"
              className="h-8 w-8"
              width={35}
              height={35}
            />
          </span>
          {!collapsed && (
            <span className="text-card-title font-extrabold tracking-[-0.5px] text-ink">
              SprintCheck
            </span>
          )}
        </a>

        {/* Primary nav */}
        <nav className="flex flex-col gap-1">
          {PRIMARY_NAV.map((item) => (
            <NavLink key={item.label} {...item} />
          ))}

          <div className="my-3 h-px bg-line" />

          <NavLink {...PROFILE_NAV} />
        </nav>

        {/* Logout pinned to bottom */}
        <button
          type="button"
          onClick={requestLogout}
          title={collapsed ? "Logout" : undefined}
          className={`mt-auto flex items-center gap-3 rounded-btn py-2.5 text-base font-medium text-body transition-colors hover:bg-subtle hover:text-ink ${collapsed ? "justify-center px-0" : "px-3"
            }`}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && "Logout"}
        </button>
      </aside>

      {/* Rendered outside the <aside> so its `hidden`/`sticky` context can't
          clip or hide the fixed-position overlay. */}
      <AnimatePresence>
        {confirmingLogout && (
          <ConfirmDialog
            tone="danger"
            icon={LogOut}
            title="Sign out?"
            description="You'll need to sign in again to access your dashboard, API keys, and verification history."
            confirmLabel="Sign out"
            loadingLabel="Signing out…"
            cancelLabel="Stay signed in"
            loading={loggingOut}
            error={logoutError}
            onConfirm={logout}
            onCancel={cancelLogout}
          />
        )}
      </AnimatePresence>
    </>
  );
}
