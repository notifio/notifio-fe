'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import type { ConsentState } from '@notifio/api-client';

import { api } from '@/lib/api';

export function useConsents() {
  const query = useQuery<ConsentState[]>({
    queryKey: ['consents'],
    queryFn: async () => {
      const raw = await api.getConsents();
      return [...raw].sort((a, b) => a.category.sortOrder - b.category.sortOrder);
    },
  });

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const updateConsent = useCallback(
    async (categoryCode: string, granted: boolean) => {
      await api.updateConsent(categoryCode, granted);
      await query.refetch();
    },
    [query],
  );

  return {
    consents: query.data ?? [],
    isLoading: query.isPending,
    error: query.error ? (query.error.message || 'Failed to load consents') : null,
    updateConsent,
    refetch,
  };
}
