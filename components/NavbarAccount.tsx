"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLogout } from "@/lib/client/useLogout";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import {
  ChevronDown,
  LayoutGrid,
  LogOut,
  User,
  type IconProps,
} from "@/components/icons";
import type { UserProfile } from "@/lib/shared/types";

/**
 * Signed-in account chip + dropdown for the public Navbar. Mirrors the
 * dashboard's UserMenu but sits on the glass header and leads with a link back
 * into the app. Rendered only once we know the visitor has a live session.
 */

const MENU_LINKS: { label: string; href: string; icon: ComponentType<IconProps> }[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Account settings", href: "/profile", icon: User },
];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function AccountMenu({ user }: { user: UserProfile }) {
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

  const name = user.name?.trim() || "Account";
  const email = user.email ?? "";

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
        className="flex h-9 items-center gap-2 rounded-btn border border-white/60 bg-white/70 pl-1 pr-2.5 transition-colors hover:bg-white"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-pill bg-brand text-[11px] font-bold text-offwhite">
          {initialsOf(name)}
        </span>
        <span className="hidden max-w-[120px] truncate text-small font-medium text-ink md:block">
          {name}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-body transition-transform duration-200 ${
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
            className="absolute right-0 top-[calc(100%+10px)] z-40 w-[264px] overflow-hidden rounded-panel border border-line bg-white shadow-glass"
          >
            {/* Identity */}
            <div className="flex items-center gap-3 border-b border-line bg-subtle/50 px-4 py-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-brand text-small font-bold text-offwhite">
                {initialsOf(name)}
              </span>
              <div className="min-w-0">
                <div className="truncate text-small font-semibold text-ink">{name}</div>
                <div className="truncate text-stat-label text-body">{email}</div>
              </div>
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
                Log out
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
            title="Log out?"
            description="You'll need to sign in again to access your dashboard, API keys, and verification history."
            confirmLabel="Log out"
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

/**
 * Signed-in identity + links for the mobile drawer. No dropdown — the items
 * sit inline where the sign-in buttons would otherwise be.
 */
export function MobileAccount({
  user,
  onNavigate,
}: {
  user: UserProfile;
  onNavigate: () => void;
}) {
  const {
    confirming: confirmingLogout,
    loggingOut,
    error: logoutError,
    logout,
    requestLogout,
    cancel: cancelLogout,
  } = useLogout();

  const name = user.name?.trim() || "Account";
  const email = user.email ?? "";

  return (
    <>
      <div className="flex items-center gap-3 px-2 pb-1">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-brand text-small font-bold text-offwhite">
          {initialsOf(name)}
        </span>
        <div className="min-w-0">
          <div className="truncate text-small font-semibold text-ink">{name}</div>
          <div className="truncate text-stat-label text-body">{email}</div>
        </div>
      </div>

      {MENU_LINKS.map(({ label, href, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-btn px-2 py-2.5 text-base font-medium text-body transition-colors hover:bg-black/5 hover:text-ink"
        >
          <Icon className="h-5 w-5 shrink-0" />
          {label}
        </Link>
      ))}

      <button
        type="button"
        onClick={() => {
          onNavigate();
          requestLogout();
        }}
        className="flex items-center gap-3 rounded-btn px-2 py-2.5 text-base font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <LogOut className="h-5 w-5 shrink-0" />
        Log out
      </button>

      <AnimatePresence>
        {confirmingLogout && (
          <ConfirmDialog
            tone="danger"
            icon={LogOut}
            title="Log out?"
            description="You'll need to sign in again to access your dashboard, API keys, and verification history."
            confirmLabel="Log out"
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
