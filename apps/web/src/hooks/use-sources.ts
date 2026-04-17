'use client';

import { useCallback } from 'react';

import type { SourceSummary, UpsertSourceRatingInput } from '@notifio/api-client';

import { api } from '@/lib/api';

import { useApiQuery } from './use-api-query';

export function useSources() {
  const { data, isLoading, error, refetch } = useApiQuery<SourceSummary[]>(
    () => api.getSources(),
    [],
  );

  const rateSource = useCallback(async (sourceAdapterId: number, body: UpsertSourceRatingInput) => {
    await api.rateSource(sourceAdapterId, body);
    await refetch();
  }, [refetch]);

  const deleteRating = useCallback(async (sourceAdapterId: number) => {
    await api.deleteSourceRating(sourceAdapterId);
    await refetch();
  }, [refetch]);

  return {
    sources: data ?? [],
    isLoading,
    error,
    rateSource,
    deleteRating,
    refetch,
  };
}
