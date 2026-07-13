"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { NavSection } from "@/lib/docs/spec";
import DocsSearch, { type SearchDoc } from "./DocsSearch";
import SidebarNav from "./SidebarNav";
import { Menu, X } from "@/components/icons";

const THEME_KEY = "sc-docs-theme";

/** Runs before paint on static pages so a dark preference never flashes light.
    Resolution order: ?theme= param → saved choice → system preference. */
const THEME_BOOT_SCRIPT = `try{var e=document.getElementById("sc-docs"),q=new URLSearchParams(location.search).get("theme"),t=q||localStorage.getItem("${THEME_KEY}");("dark"===t||!t&&matchMedia("(prefers-color-scheme: dark)").matches)&&e.classList.add("dark")}catch(n){}`;

function readTheme(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const param = new URLSearchParams(window.location.search).get("theme");
    if (param === "dark" || param === "light") return param === "dark";
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

function SunIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function DocsChrome({
  nav,
  searchDocs,
  children,
}: {
  nav: NavSection[];
  searchDocs: SearchDoc[];
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  // Lazy init matches whatever the boot script already applied to the DOM,
  // so hydration never repaints the theme.
  const [dark, setDark] = useState(readTheme);
  // The toggle icon depends on client-only state; render it only after mount
  // so server and first client render agree (avoids a hydration mismatch).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const pathname = usePathname();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setMenuOpen(false), [pathname]);

  const toggleTheme = () => {
    setDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      } catch {
        // Storage unavailable — the choice just won't persist.
      }
      return next;
    });
  };

  return (
    <div
      id="sc-docs"
      suppressHydrationWarning
      className={`${dark ? "dark" : ""} min-h-screen bg-surface`}
    >
      <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      {/* Topbar */}
      <header className="sticky top-0 z-50 border-b border-line bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-container items-center gap-4 px-4 md:px-6">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            className="flex h-9 w-9 items-center justify-center rounded-btn text-ink transition-colors hover:bg-black/5 dark:hover:bg-white/10 lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="SprintCheck home">
            <Image
              src="/logo-sprintcheck.png"
              alt="SprintCheck"
              width={71}
              height={46}
              className="h-9 w-auto dark:invert dark:mix-blend-screen"
            />
          </Link>
          <span aria-hidden="true" className="hidden h-5 w-px bg-line md:block" />
          <Link
            href="/docs"
            className="hidden items-center gap-2 font-mono text-[12px] font-medium text-body transition-colors hover:text-ink md:flex"
          >
            API Reference
            <span className="rounded-pill bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand-accent">
              v1
            </span>
          </Link>

          <div className="flex flex-1 justify-end md:justify-center">
            <DocsSearch docs={searchDocs} />
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            title="Toggle color theme"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-btn text-body transition-colors hover:bg-black/5 hover:text-ink dark:hover:bg-white/10"
          >
            {mounted && dark ? (
              <SunIcon className="h-[18px] w-[18px]" />
            ) : (
              <MoonIcon className="h-[18px] w-[18px]" />
            )}
          </button>

          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <Link
              href="/sandbox"
              className="flex h-9 items-center rounded-btn px-3 text-small font-medium text-ink transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            >
              Sandbox
            </Link>
            <Link
              href="/signup"
              className="flex h-9 items-center rounded-btn bg-brand px-4 text-small font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px"
            >
              Get API keys
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-container px-4 md:px-6">
        {/* Sidebar — desktop */}
        <aside className="sticky top-14 hidden h-[calc(100vh-56px)] w-[272px] shrink-0 overflow-y-auto border-r border-line py-6 pr-4 lg:block">
          <SidebarNav nav={nav} />
        </aside>

        {/* Sidebar — mobile drawer (kept mounted so it can slide in and out) */}
        <div
          className={`fixed inset-0 top-14 z-40 transition-[visibility] duration-300 lg:hidden ${
            menuOpen ? "visible" : "invisible pointer-events-none"
          }`}
          aria-hidden={!menuOpen}
        >
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ease-smooth motion-reduce:transition-none ${
              menuOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            className={`absolute inset-y-0 left-0 w-[300px] max-w-[85vw] overflow-y-auto border-r border-line bg-surface p-4 shadow-glass transition-transform duration-300 ease-smooth motion-reduce:transition-none ${
              menuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <SidebarNav nav={nav} onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>

        {/* Content */}
        <main className="min-w-0 flex-1 py-8 lg:pl-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
