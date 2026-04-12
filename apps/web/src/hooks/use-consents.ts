'use client';

import { useCallback, useEffect, useState } from 'react';

import type { ConsentState } from '@notifio/api-client';

import { api } from '@/lib/api';

interface UseConsentsResult {
  consents: ConsentState[];
  loading: boolean;
  error: string | null;
  updateConsent: (categoryCode: string, granted: boolean) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useConsents(): UseConsentsResult {
  const [consents, setConsents] = useState<ConsentState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConsents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getConsents();
      const sorted = [...data].sort(
        (a, b) => a.category.sortOrder - b.category.sortOrder,
      );
      setConsents(sorted);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load consents';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConsents();
  }, [fetchConsents]);

  const updateConsent = useCallback(async (categoryCode: string, granted: boolean) => {
    const updated = await api.updateConsent(categoryCode, granted);
    setConsents((prev) =>
      prev.map((c) =>
        c.category.categoryCode === categoryCode ? updated : c,
      ),
    );
  }, []);

  return {
    consents,
    loading,
    error,
    updateConsent,
    refetch: fetchConsents,
  };
}
