"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "./endpoints";

/**
 * Shared sign-out flow (confirm → call BFF → redirect) used by both the
 * desktop sidebar and the mobile nav drawer.
 */
export function useLogout() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function logout() {
    setLoggingOut(true);
    setError(null);
    try {
      await authApi.logout();
      router.push("/signin");
    } catch (err) {
      // The cookie may still be live — keep the user here and let them retry
      // rather than stranding them on a half-signed-out app.
      setError(err instanceof Error ? err.message : "Could not sign you out. Try again.");
      setLoggingOut(false);
    }
  }

  function requestLogout() {
    setConfirming(true);
  }

  function cancel() {
    setConfirming(false);
    setError(null);
  }

  return { confirming, loggingOut, error, logout, requestLogout, cancel };
}
