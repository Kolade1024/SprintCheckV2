"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PRIMARY_NAV, PROFILE_NAV, type NavItem } from "@/components/dashboard/Sidebar";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import { useLogout } from "@/lib/client/useLogout";
import { LogOut, Menu, ShieldCheck, X } from "@/components/icons";

/**
 * Hamburger + slide-in drawer for mobile/tablet, shown from the Topbar below
 * the `lg` breakpoint where the desktop <Sidebar> is hidden. Shares nav items
 * and the sign-out flow with the sidebar so the two can't drift apart.
 */
export default function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const {
    confirming: confirmingLogout,
    loggingOut,
    error: logoutError,
    logout,
    requestLogout,
    cancel: cancelLogout,
  } = useLogout();

  // Close the drawer when navigation happens (pathname changes).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  function NavLink({ label, href, icon: Icon }: NavItem) {
    const active = isActive(href);
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-3 rounded-btn px-3 py-3 text-base font-medium transition-colors ${active
          ? "bg-brand text-offwhite shadow-glow"
          : "text-body hover:bg-subtle hover:text-ink"
          }`}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span className="flex-1 truncate">{label}</span>
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-panel border border-line bg-white text-body shadow-card transition-colors hover:bg-subtle hover:text-ink lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col overflow-y-auto bg-white p-5 shadow-glass"
            >
              <div className="mb-6 flex items-center justify-between">
                <a href="/" className="flex items-center gap-2.5" aria-label="SprintCheck home">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-card bg-transparent shadow-glow">
                    <img
                      src="/icon_app.png"
                      alt="SprintCheck Logo Icon"
                      className="h-8 w-8"
                      width={35}
                      height={35}
                    />
                  </span>
                  <span className="text-card-title font-extrabold tracking-[-0.5px] text-ink">
                    SprintCheck
                  </span>
                </a>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close navigation menu"
                  className="flex h-9 w-9 items-center justify-center rounded-btn text-body transition-colors hover:bg-black/5 hover:text-ink"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {PRIMARY_NAV.map((item) => (
                  <NavLink key={item.label} {...item} />
                ))}

                <div className="my-3 h-px bg-line" />

                <NavLink {...PROFILE_NAV} />
              </nav>

              <button
                type="button"
                onClick={requestLogout}
                className="mt-auto flex items-center gap-3 rounded-btn px-3 py-3 text-base font-medium text-body transition-colors hover:bg-subtle hover:text-ink"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                Logout
              </button>
            </motion.aside>
          </div>
        )}

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
