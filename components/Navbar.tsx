"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, X } from "./icons";

// Root-relative anchors (/#…) so section links work from any page, not just
// the homepage — on /sandbox or /contact they navigate home, then scroll.
const NAV_LINKS = [
  { label: "Products", href: "/#products" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Developers", href: "/#developers" },
  { label: "Docs", href: "/docs" },
  { label: "Sandbox", href: "/sandbox" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed w-full top-0 z-50 pt-3 bg-transparent">
      <div className="container-x">
        <nav className="animate-fade-down rounded-panel border border-white/60 bg-white/70 px-[21.33px] py-[13.33px] shadow-glass backdrop-blur-md motion-reduce:animate-none">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <a href="/" className="flex items-center" aria-label="SprintCheck home">
              <Image
                src="/logo-sprintcheck.png"
                alt="SprintCheck"
                width={71}
                height={46}
                priority
                className="h-[46px] w-auto"
              />
            </a>

            {/* Desktop nav links */}
            <ul className="hidden items-center gap-8 lg:flex">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-small font-medium text-body transition-colors hover:text-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Desktop actions */}
            <div className="hidden items-center gap-2 lg:flex">
              <a
                href="/signin"
                className="flex h-9 items-center justify-center rounded-btn px-4 text-small font-medium text-ink transition-colors hover:bg-black/5"
              >
                Sign in
              </a>
              <a
                href="/sandbox"
                className="flex h-9 items-center justify-center rounded-btn bg-brand px-4 text-small font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px"
              >
                Try sandbox
              </a>
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="flex h-10 w-10 items-center justify-center rounded-btn text-ink transition-colors hover:bg-black/5 lg:hidden"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile menu — smooth expand/collapse */}
          <div
            id="mobile-menu"
            className={`grid overflow-hidden transition-all duration-300 ease-smooth lg:hidden ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
          >
            <div className="min-h-0">
              <ul className="flex flex-col gap-1 pt-4">
                {NAV_LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-btn px-2 py-2.5 text-base font-medium text-body transition-colors hover:bg-black/5 hover:text-ink"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-col gap-2 border-t border-line pt-4">
                <a
                  href="/signin"
                  className="flex h-11 items-center justify-center rounded-btn border border-line text-small font-medium text-ink"
                >
                  Sign in
                </a>
                <a
                  href="/sandbox"
                  className="flex h-11 items-center justify-center rounded-btn bg-brand text-small font-medium text-offwhite shadow-glow"
                >
                  Try sandbox
                </a>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
