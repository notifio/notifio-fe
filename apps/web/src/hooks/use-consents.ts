'use client';

import { useCallback } from 'react';

import type { ConsentState } from '@notifio/api-client';

import { api } from '@/lib/api';

import { useApiQuery } from './use-api-query';

export function useConsents() {
  const { data, isLoading, error, refetch } = useApiQuery<ConsentState[]>(
    async () => {
      const raw = await api.getConsents();
      return [...raw].sort((a, b) => a.category.sortOrder - b.category.sortOrder);
    },
    [],
  );

  const updateConsent = useCallback(async (categoryCode: string, granted: boolean) => {
    await api.updateConsent(categoryCode, granted);
    await refetch();
  }, [refetch]);

  return {
    consents: data ?? [],
    isLoading,
    error,
    updateConsent,
    refetch,
  };
}
