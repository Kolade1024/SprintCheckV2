"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Runs a request on mount and exposes { data, loading, error, refetch }.
 *
 * The fetcher is kept in a ref so callers can pass an inline arrow function
 * without retriggering the effect on every render. In-flight requests are
 * aborted on unmount and superseded requests are ignored.
 */
export function useApi<T>(fetcher: (signal: AbortSignal) => Promise<T>): UseApiResult<T> {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Bumping this restarts the effect below — that's the whole refetch story.
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetcherRef
      .current(controller.signal)
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled || (err instanceof DOMException && err.name === "AbortError")) return;
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [generation]);

  const refetch = useCallback(() => setGeneration((g) => g + 1), []);

  return { data, loading, error, refetch };
}
