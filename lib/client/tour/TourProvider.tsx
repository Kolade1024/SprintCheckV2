"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppData } from "@/lib/client/AppDataProvider";
import { getCookieConsent } from "@/components/CookieConsent";
import { TOUR_STEPS, TOUR_VERSION, type TourStep } from "./steps";
import type { AccountDetails, DashboardSummary } from "@/lib/shared/types";

/**
 * Drives the first-login tour: which step is showing, navigating between the
 * routes steps live on, and remembering that a user has finished.
 *
 * Completion is stored per user in localStorage — the API has no
 * "onboarding completed" field, so this is per-browser by design. A user who
 * clears storage or signs in elsewhere would see the tour again, which is why
 * `isNewUser` also gates on account signals: an established account never
 * gets it re-shown regardless of what storage says.
 */

const LG_BREAKPOINT = 1024; // matches Tailwind `lg`, where the sidebar appears
const ANCHOR_TIMEOUT_MS = 4000;
const NEW_ACCOUNT_DAYS = 14;

interface TourContextValue {
  /** The step being shown, or null when the tour isn't running. */
  step: TourStep | null;
  /** 0-based index into the *visible* steps, for progress display. */
  index: number;
  total: number;
  /** Element the current step points at; null for centred steps. */
  anchorEl: HTMLElement | null;
  /** True while navigating or waiting for an anchor to mount. */
  settling: boolean;
  next: () => void;
  back: () => void;
  skip: () => void;
  start: () => void;
  /** Whether a replay entry point should be offered. */
  canReplay: boolean;
}

const TourContext = createContext<TourContextValue | null>(null);

function storageKey(userId: number | string): string {
  return `sc_tour:v${TOUR_VERSION}:${userId}`;
}

function hasSeenTour(userId: number | string): boolean {
  try {
    return window.localStorage.getItem(storageKey(userId)) !== null;
  } catch {
    // Private mode or storage disabled — treat as seen so we never trap
    // someone in a tour that can't remember it finished.
    return true;
  }
}

function markTourSeen(userId: number | string, outcome: "done" | "skipped"): void {
  try {
    window.localStorage.setItem(storageKey(userId), outcome);
  } catch {
    /* nothing we can do; the tour just won't be remembered */
  }
}

/**
 * A genuinely new account, judged from data we already load. Storage says
 * whether *this browser* has seen the tour; this says whether the user looks
 * like someone who'd still benefit from it.
 */
export function isNewUser(
  summary: DashboardSummary | null,
  account: AccountDetails | null,
): boolean {
  if (!summary) return false;

  // Anyone who has run a verification has found their way around already.
  if ((summary.api_calls?.total ?? 0) > 0) return false;
  if ((summary.virtual_accounts?.length ?? 0) > 0) return false;
  if ((account?.business?.walletBalance ?? summary.wallet_balance ?? 0) > 0) return false;

  const created = summary.user?.created_at;
  if (!created) return true; // no signal either way — err towards helping

  const age = Date.now() - new Date(created).getTime();
  if (Number.isNaN(age)) return true;
  return age <= NEW_ACCOUNT_DAYS * 24 * 60 * 60 * 1000;
}

/** Resolves once the selector matches, or null if it never shows up. */
function waitForAnchor(selector: string, signal: AbortSignal): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLElement>(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const started = Date.now();
    const timer = window.setInterval(() => {
      if (signal.aborted) {
        window.clearInterval(timer);
        resolve(null);
        return;
      }
      const el = document.querySelector<HTMLElement>(selector);
      if (el || Date.now() - started > ANCHOR_TIMEOUT_MS) {
        window.clearInterval(timer);
        resolve(el ?? null);
      }
    }, 100);

    signal.addEventListener("abort", () => {
      window.clearInterval(timer);
      resolve(null);
    });
  });
}

export function TourProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { summary, account, loading } = useAppData();

  const [running, setRunning] = useState(false);
  const [index, setIndex] = useState(0);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [settling, setSettling] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [consentSettled, setConsentSettled] = useState(false);
  const autoStarted = useRef(false);
  const resolveRef = useRef<AbortController | null>(null);

  const userId = summary?.user?.id ?? account?.id ?? null;

  // The cookie banner is its own first-run overlay and sits above the tour
  // (z-80 vs z-60). Wait for that choice so a new user isn't handed two
  // competing prompts. It writes straight to localStorage, so poll for it.
  useEffect(() => {
    if (getCookieConsent() !== null) {
      setConsentSettled(true);
      return;
    }
    const timer = window.setInterval(() => {
      if (getCookieConsent() !== null) {
        setConsentSettled(true);
        window.clearInterval(timer);
      }
    }, 400);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`);
    const sync = () => setIsDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Steps that can't be shown at this width drop out entirely, so progress
  // counts stay honest ("2 of 7", not "2 of 8 with one skipped").
  const steps = useMemo(
    () => TOUR_STEPS.filter((s) => isDesktop || !s.desktopOnly),
    [isDesktop],
  );

  const step = running ? (steps[index] ?? null) : null;

  const finish = useCallback(
    (outcome: "done" | "skipped") => {
      resolveRef.current?.abort();
      setRunning(false);
      setAnchorEl(null);
      setSettling(false);
      if (userId != null) markTourSeen(userId, outcome);
    },
    [userId],
  );

  const start = useCallback(() => {
    resolveRef.current?.abort();
    setIndex(0);
    setAnchorEl(null);
    setRunning(true);
  }, []);

  const next = useCallback(() => {
    setIndex((i) => {
      if (i >= steps.length - 1) {
        finish("done");
        return i;
      }
      return i + 1;
    });
  }, [steps.length, finish]);

  const back = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const skip = useCallback(() => finish("skipped"), [finish]);

  // Auto-start once, for a new account that hasn't seen the tour here.
  useEffect(() => {
    if (autoStarted.current || running || loading || userId == null) return;
    if (!consentSettled) return;
    if (pathname !== "/dashboard") return;
    if (hasSeenTour(userId) || !isNewUser(summary, account)) {
      autoStarted.current = true;
      return;
    }
    autoStarted.current = true;
    start();
  }, [running, loading, userId, pathname, summary, account, start, consentSettled]);

  // Navigate to the step's route, then wait for its anchor before revealing.
  useEffect(() => {
    if (!step) return;

    resolveRef.current?.abort();
    const controller = new AbortController();
    resolveRef.current = controller;

    setSettling(true);
    setAnchorEl(null);

    if (pathname !== step.route) {
      router.push(step.route);
      return; // this effect re-runs once `pathname` catches up
    }

    const selector = (!isDesktop && step.mobileAnchor) || step.anchor;
    if (!selector) {
      setSettling(false);
      return;
    }

    let cancelled = false;
    waitForAnchor(selector, controller.signal).then((el) => {
      if (cancelled || controller.signal.aborted) return;
      if (el) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        // Let the scroll settle before the overlay measures the element.
        window.setTimeout(() => {
          if (!cancelled && !controller.signal.aborted) {
            setAnchorEl(el);
            setSettling(false);
          }
        }, 320);
      } else {
        // Anchor never appeared — show the copy centred rather than stalling.
        setAnchorEl(null);
        setSettling(false);
      }
    });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [step, pathname, router, isDesktop]);

  const value = useMemo<TourContextValue>(
    () => ({
      step,
      index,
      total: steps.length,
      anchorEl,
      settling,
      next,
      back,
      skip,
      start,
      canReplay: userId != null,
    }),
    [step, index, steps.length, anchorEl, settling, next, back, skip, start, userId],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour(): TourContextValue {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used inside <TourProvider> (the app shell layout).");
  }
  return context;
}
