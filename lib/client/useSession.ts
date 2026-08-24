"use client";

import { useEffect, useState } from "react";
import { appApi } from "./endpoints";
import { SESSION_HINT_COOKIE } from "@/lib/shared/constants";
import type { UserProfile } from "@/lib/shared/types";

type SessionState =
  | { status: "loading"; user: null }
  | { status: "authed"; user: UserProfile }
  | { status: "guest"; user: null };

const GUEST: SessionState = { status: "guest", user: null };

/** Reads the non-httpOnly hint cookie set alongside the real session cookie. */
function hasSessionHint(): boolean {
  return document.cookie
    .split(";")
    .some((entry) => entry.trim().startsWith(`${SESSION_HINT_COOKIE}=`));
}

/**
 * Detects whether the visitor has a live session, for public pages that need
 * to show an account menu instead of sign-in buttons.
 *
 * The token itself lives in an httpOnly cookie the browser can't read, so this
 * used to probe /dashboard on every page and treat the 401 as "signed out" —
 * which meant every logged-out visitor to a marketing page paid for a failed
 * request and saw a console error. `createSession` now also sets a readable,
 * token-free hint cookie, so the common case (no session at all) is answered
 * locally and the probe only runs when there's actually something to confirm.
 *
 * The hint can outlive the real session — an expired or revoked token still
 * leaves it behind — so it's treated as "worth checking", never as proof: the
 * probe still decides, and any failure falls back to the signed-out UI.
 */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ status: "loading", user: null });

  useEffect(() => {
    if (!hasSessionHint()) {
      setState(GUEST);
      return;
    }

    const controller = new AbortController();

    appApi
      .dashboard(controller.signal)
      .then((summary) => {
        if (controller.signal.aborted) return;
        setState(
          summary.user
            ? { status: "authed", user: summary.user }
            : GUEST,
        );
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (controller.signal.aborted) return;
        // 401 (expired/revoked session) and any other failure both fall back to
        // the signed-out UI — the worst case is showing sign-in to a signed-in
        // user, which the next navigation corrects.
        setState(GUEST);
      });

    return () => controller.abort();
  }, []);

  return state;
}
