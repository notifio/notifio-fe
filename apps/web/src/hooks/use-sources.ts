'use client';

import { useCallback, useEffect, useState } from 'react';

import type { SourceSummary, UpsertSourceRatingInput } from '@notifio/api-client';

import { api } from '@/lib/api';

interface UseSourcesResult {
  sources: SourceSummary[];
  isLoading: boolean;
  error: string | null;
  rateSource: (sourceAdapterId: number, body: UpsertSourceRatingInput) => Promise<void>;
  deleteRating: (sourceAdapterId: number) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useSources(): UseSourcesResult {
  const [sources, setSources] = useState<SourceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSources();
      setSources(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load sources';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const rateSource = useCallback(async (sourceAdapterId: number, body: UpsertSourceRatingInput) => {
    const updated = await api.rateSource(sourceAdapterId, body);
    setSources((prev) =>
      prev.map((s) => (s.sourceAdapterId === sourceAdapterId ? updated : s)),
    );
  }, []);

  const deleteRating = useCallback(async (sourceAdapterId: number) => {
    await api.deleteSourceRating(sourceAdapterId);
    setSources((prev) =>
      prev.map((s) =>
        s.sourceAdapterId === sourceAdapterId ? { ...s, ownRating: null } : s,
      ),
    );
  }, []);

  return {
    sources,
    isLoading: loading,
    error,
    rateSource,
    deleteRating,
    refetch: fetchSources,
  };
}
