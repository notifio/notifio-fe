import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import type { SourceSummary, UpsertSourceRatingInput } from '@notifio/api-client';

import { api } from '../lib/api';
import { showToast } from '../lib/toast';

interface UseSourcesResult {
  sources: SourceSummary[];
  isLoading: boolean;
  error: string | null;
  rateSource: (sourceAdapterId: number, body: UpsertSourceRatingInput) => Promise<void>;
  deleteRating: (sourceAdapterId: number) => Promise<void>;
  refetch: () => void;
}

/**
 * Source ratings list + write-side ops. Mutations refetch the cache on
 * success and emit i18n-resolved toasts on success/failure (preserved
 * from the prior `useState/useEffect` version).
 */
export function useSources(): UseSourcesResult {
  const { t } = useTranslation();
  const query = useQuery<SourceSummary[]>({
    queryKey: ['sources'],
    queryFn: () => api.getSources(),
  });

  const rateSource = useCallback(
    async (sourceAdapterId: number, body: UpsertSourceRatingInput) => {
      try {
        await api.rateSource(sourceAdapterId, body);
        await query.refetch();
        showToast.success(t('sources.saved'));
      } catch {
        showToast.error(t('sources.error'));
      }
    },
    [query, t],
  );

  const deleteRating = useCallback(
    async (sourceAdapterId: number) => {
      try {
        await api.deleteSourceRating(sourceAdapterId);
        await query.refetch();
        showToast.success(t('sources.deleted'));
      } catch {
        showToast.error(t('sources.error'));
      }
    },
    [query, t],
  );

  return {
    sources: query.data ?? [],
    isLoading: query.isPending,
    error: query.error ? (query.error.message || 'Failed to load sources') : null,
    rateSource,
    deleteRating,
    refetch: () => {
      void query.refetch();
    },
  };
}
