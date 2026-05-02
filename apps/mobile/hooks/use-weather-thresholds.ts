import { useCallback, useEffect, useMemo, useState } from 'react';

import type { UserWeatherThreshold } from '@notifio/api-client';

import { api } from '../lib/api';
import { showToast } from '../lib/toast';

interface UseWeatherThresholdsResult {
  thresholds: UserWeatherThreshold[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  setThreshold: (code: string, value: number) => Promise<void>;
  removeThreshold: (code: string) => Promise<void>;
  getByCode: (code: string) => UserWeatherThreshold | undefined;
}

export function useWeatherThresholds(): UseWeatherThresholdsResult {
  const [thresholds, setThresholds] = useState<UserWeatherThreshold[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getWeatherThresholds();
      setThresholds(data);
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to load thresholds');
      setError(e);
      showToast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const setThreshold = useCallback(
    async (code: string, value: number) => {
      // Optimistic update with rollback
      const previous = thresholds;
      const existingIdx = previous.findIndex((t) => t.subcategoryCode === code);
      const optimistic: UserWeatherThreshold[] =
        existingIdx >= 0
          ? previous.map((t) =>
              t.subcategoryCode === code ? { ...t, threshold: value } : t,
            )
          : [...previous, { subcategoryCode: code, threshold: value } as UserWeatherThreshold];
      setThresholds(optimistic);
      try {
        const result = await api.setWeatherThreshold({ subcategoryCode: code, threshold: value });
        // Replace optimistic entry with server response (preserves any extra fields)
        setThresholds((curr) => {
          const idx = curr.findIndex((t) => t.subcategoryCode === code);
          if (idx >= 0) {
            const next = [...curr];
            next[idx] = result;
            return next;
          }
          return [...curr, result];
        });
      } catch (err) {
        setThresholds(previous);
        const e = err instanceof Error ? err : new Error('Failed to save threshold');
        showToast.error(e.message);
        throw e;
      }
    },
    [thresholds],
  );

  const removeThreshold = useCallback(
    async (code: string) => {
      const previous = thresholds;
      setThresholds((curr) => curr.filter((t) => t.subcategoryCode !== code));
      try {
        await api.deleteWeatherThreshold(code);
      } catch (err) {
        setThresholds(previous);
        const e = err instanceof Error ? err : new Error('Failed to remove threshold');
        showToast.error(e.message);
        throw e;
      }
    },
    [thresholds],
  );

  const byCodeMap = useMemo(() => {
    const m = new Map<string, UserWeatherThreshold>();
    for (const t of thresholds) m.set(t.subcategoryCode, t);
    return m;
  }, [thresholds]);

  const getByCode = useCallback((code: string) => byCodeMap.get(code), [byCodeMap]);

  return { thresholds, isLoading, error, refetch: fetch, setThreshold, removeThreshold, getByCode };
}
