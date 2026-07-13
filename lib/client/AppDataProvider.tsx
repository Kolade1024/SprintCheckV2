"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { appApi } from "./endpoints";
import { ApiError } from "./http";
import type { DashboardSummary } from "@/lib/shared/types";

interface AppDataContextValue {
  /** The /dashboard summary shared by every page in the authenticated shell. */
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

/**
 * Loads the dashboard summary once for the whole authenticated shell and
 * redirects to sign-in when the session is missing or expired (BFF 401).
 */
export function AppDataProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generation, setGeneration] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    appApi
      .dashboard(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setSummary(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/signin");
          return;
        }
        setError(err instanceof Error ? err.message : "Could not load your account.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [generation, router]);

  const refresh = useCallback(() => setGeneration((g) => g + 1), []);

  return (
    <AppDataContext.Provider value={{ summary, loading, error, refresh }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used inside <AppDataProvider> (the app shell layout).");
  }
  return context;
}
