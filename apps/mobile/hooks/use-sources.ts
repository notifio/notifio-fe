import { useCallback, useEffect, useState } from 'react';
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

export function useSources(): UseSourcesResult {
  const { t } = useTranslation();
  const [sources, setSources] = useState<SourceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getSources();
      setSources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sources');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const rateSource = useCallback(
    async (sourceAdapterId: number, body: UpsertSourceRatingInput) => {
      try {
        await api.rateSource(sourceAdapterId, body);
        await fetch();
        showToast.success(t('sources.saved'));
      } catch {
        showToast.error(t('sources.error'));
      }
    },
    [fetch, t],
  );

  const deleteRating = useCallback(
    async (sourceAdapterId: number) => {
      try {
        await api.deleteSourceRating(sourceAdapterId);
        await fetch();
        showToast.success(t('sources.deleted'));
      } catch {
        showToast.error(t('sources.error'));
      }
    },
    [fetch, t],
  );

  return { sources, isLoading, error, rateSource, deleteRating, refetch: fetch };
}
