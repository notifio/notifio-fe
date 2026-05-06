'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import type { SourceSummary, UpsertSourceRatingInput } from '@notifio/api-client';

import { api } from '@/lib/api';

export function useSources() {
  const query = useQuery<SourceSummary[]>({
    queryKey: ['sources'],
    queryFn: () => api.getSources(),
  });

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const rateSource = useCallback(
    async (sourceAdapterId: number, body: UpsertSourceRatingInput) => {
      await api.rateSource(sourceAdapterId, body);
      await query.refetch();
    },
    [query],
  );

  const deleteRating = useCallback(
    async (sourceAdapterId: number) => {
      await api.deleteSourceRating(sourceAdapterId);
      await query.refetch();
    },
    [query],
  );

  return {
    sources: query.data ?? [],
    isLoading: query.isPending,
    error: query.error ? (query.error.message || 'Failed to load sources') : null,
    rateSource,
    deleteRating,
    refetch,
  };
}
