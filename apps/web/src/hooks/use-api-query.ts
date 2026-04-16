'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseApiQueryOptions {
  enabled?: boolean;
}

interface UseApiQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useApiQuery<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[],
  options?: UseApiQueryOptions,
): UseApiQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchIdRef = useRef(0);

  const enabled = options?.enabled ?? true;

  const execute = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const id = ++fetchIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      // Discard stale response if deps changed mid-fetch
      if (id !== fetchIdRef.current) return;
      setData(result);
    } catch (err) {
      if (id !== fetchIdRef.current) return;
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      if (id === fetchIdRef.current) {
        setIsLoading(false);
      }
    }
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, isLoading, error, refetch: execute };
}
