"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAppData } from "@/lib/client/AppDataProvider";
import { useLogout } from "@/lib/client/useLogout";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import {
  ChevronDown,
  CodeBrackets,
  LogOut,
  Receipt,
  User,
  type IconProps,
} from "@/components/icons";
import type { ComponentType } from "react";

/**
 * Account chip + dropdown in the Topbar: identity header, quick links to the
 * account-centric pages, and sign-out (with the shared confirm flow).
 */

const MENU_LINKS: { label: string; href: string; icon: ComponentType<IconProps> }[] = [
  { label: "Account settings", href: "/profile", icon: User },
  { label: "Billing", href: "/billing", icon: Receipt },
  { label: "API keys", href: "/developers", icon: CodeBrackets },
];

function initialOf(name: string | undefined): string {
  return name?.trim()?.charAt(0)?.toUpperCase() || "U";
}

export default function UserMenu() {
  const { summary } = useAppData();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const {
    confirming: confirmingLogout,
    loggingOut,
    error: logoutError,
    logout,
    requestLogout,
    cancel: cancelLogout,
  } = useLogout();

  const name = summary?.user?.name ?? "";
  const email = summary?.user?.email ?? "";

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-12 items-center gap-2.5 rounded-panel border border-line bg-white pl-1.5 pr-3 shadow-card transition-colors hover:bg-subtle"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-pill bg-brand text-small font-bold text-offwhite">
          {initialOf(name)}
        </span>
        <span className="hidden flex-col items-start leading-tight md:flex">
          <span className="text-small font-semibold text-ink">{name || "Account"}</span>
          <span className="text-stat-label text-body">Live mode</span>
        </span>
        <ChevronDown
          className={`hidden h-4 w-4 text-body transition-transform duration-200 md:block ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="absolute right-0 top-[calc(100%+8px)] z-40 w-[264px] overflow-hidden rounded-panel border border-line bg-white shadow-glass"
          >
            {/* Identity */}
            <div className="flex items-center gap-3 border-b border-line bg-subtle/50 px-4 py-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-brand text-small font-bold text-offwhite">
                {initialOf(name)}
              </span>
              <div className="min-w-0">
                <div className="truncate text-small font-semibold text-ink">
                  {name || "Account"}
                </div>
                <div className="truncate text-stat-label text-body">{email}</div>
              </div>
              <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-pill bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Live
              </span>
            </div>

            {/* Links */}
            <div className="p-1.5">
              {MENU_LINKS.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-btn px-3 py-2.5 text-small font-medium text-body transition-colors hover:bg-subtle hover:text-ink"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              ))}
            </div>

            {/* Sign out */}
            <div className="border-t border-line p-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  requestLogout();
                }}
                className="flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-small font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
    </div>
  );
}
