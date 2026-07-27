"use client";

import { useEffect, useState } from "react";
import { appApi } from "./endpoints";
import type { UserProfile } from "@/lib/shared/types";

type SessionState =
  | { status: "loading"; user: null }
  | { status: "authed"; user: UserProfile }
  | { status: "guest"; user: null };

/**
 * Detects whether the visitor has a live session, for public pages that need
 * to show an account menu instead of sign-in buttons. The session token lives
 * in an httpOnly cookie the browser can't read, so we probe the BFF: a 200
 * from /dashboard means we're signed in (and hands us the profile in one hop),
 * anything else means guest.
 */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ status: "loading", user: null });

  useEffect(() => {
    const controller = new AbortController();

    appApi
      .dashboard(controller.signal)
      .then((summary) => {
        if (controller.signal.aborted) return;
        setState(
          summary.user
            ? { status: "authed", user: summary.user }
            : { status: "guest", user: null },
        );
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (controller.signal.aborted) return;
        // 401 (no/expired session) and any other failure both fall back to the
        // signed-out UI — the worst case is showing sign-in to a signed-in user.
        setState({ status: "guest", user: null });
      });

    return () => controller.abort();
  }, []);

  return state;
}
