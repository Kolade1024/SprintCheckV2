"use client";

import { useEffect, useState } from "react";

/**
 * Cookie consent banner. Shows on first visit, records the choice in
 * localStorage, and stays hidden afterwards. The site currently loads no
 * non-essential trackers, so the choice is a compliance signal — read
 * `getCookieConsent()` before initialising any analytics you add later.
 */
const STORAGE_KEY = "sc-cookie-consent";

type Consent = "all" | "essential";

export function getCookieConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as { choice?: Consent }) : null;
    return parsed?.choice ?? null;
  } catch {
    return null;
  }
}

export default function CookieConsent() {
  // Render nothing until mounted so the server and first client render match,
  // then reveal only if no choice has been stored yet.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getCookieConsent() === null) setVisible(true);
  }, []);

  function decide(choice: Consent) {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ choice, at: new Date().toISOString() })
      );
    } catch {
      // localStorage unavailable (private mode) — hide for this session anyway.
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      // The wrapper spans a wide area but is only a positioning frame — let
      // clicks pass through it (so it never blocks footer links underneath);
      // only the visible card captures pointer events.
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] p-4 md:bottom-5 md:left-5 md:right-auto md:w-[400px] md:p-0"
    >
      <div className="pointer-events-auto animate-fade-up rounded-panel border border-line bg-white/95 p-5 shadow-glass backdrop-blur-md motion-reduce:animate-none">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-brand/10 text-brand-accent">
            <CookieGlyph className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <h2 className="text-small font-semibold text-ink">We use cookies</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-body">
              Essential cookies keep SprintCheck running. With your consent we
              also use analytics cookies to improve it — see our{" "}
              <a
                href="/privacy"
                className="font-medium text-brand-accent underline-offset-2 hover:underline"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => decide("essential")}
            className="inline-flex h-9 items-center justify-center rounded-btn px-3.5 text-small font-medium text-body transition-colors hover:bg-black/5 hover:text-ink"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => decide("all")}
            className="inline-flex h-9 items-center justify-center rounded-btn bg-brand px-4 text-small font-medium text-offwhite shadow-glow transition-transform hover:-translate-y-px"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}

function CookieGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-4-4 4 4 0 0 1-4-4 2 2 0 0 0-2-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="10.5" r="1" fill="currentColor" />
      <circle cx="13.5" cy="14.5" r="1" fill="currentColor" />
      <circle cx="8.5" cy="15" r="1" fill="currentColor" />
    </svg>
  );
}
