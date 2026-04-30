'use client';

import { useLocale } from 'next-intl';
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
  // Pulled from next-intl: re-renders when the locale context changes
  // (LanguageSwitcher writes a cookie + router.refresh(), which the
  // server's NextIntlClientProvider picks up on re-render). Adding it to
  // the execute deps makes every useApiQuery call refetch with the new
  // Accept-Language header automatically — without each caller having
  // to remember to include locale in their own deps array. (I18N-2)
  const locale = useLocale();

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
  }, [...deps, locale]);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, isLoading, error, refetch: execute };
}
