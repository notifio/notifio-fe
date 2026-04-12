'use client';

import { useCallback, useEffect, useState } from 'react';

import type { UserEventCategory } from '@notifio/api-client';

import { api } from '@/lib/api';

interface UseEventCategoriesResult {
  categories: UserEventCategory[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

let cachedCategories: UserEventCategory[] | null = null;

export function useEventCategories(): UseEventCategoriesResult {
  const [categories, setCategories] = useState<UserEventCategory[]>(
    cachedCategories ?? [],
  );
  const [loading, setLoading] = useState(cachedCategories === null);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (cachedCategories) {
      setCategories(cachedCategories);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await api.getEventCategories();
      cachedCategories = data;
      setCategories(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load categories';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const retry = useCallback(() => {
    cachedCategories = null;
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, retry };
}
