import { useCallback, useEffect, useState } from 'react';

import type { UserEventCategory } from '@notifio/api-client';

import { api } from '../lib/api';

let cachedCategories: UserEventCategory[] | null = null;

interface UseEventCategoriesResult {
  categories: UserEventCategory[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

export function useEventCategories(): UseEventCategoriesResult {
  const [categories, setCategories] = useState<UserEventCategory[]>(cachedCategories ?? []);
  const [isLoading, setIsLoading] = useState(cachedCategories === null);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (cachedCategories) {
      setCategories(cachedCategories);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getEventCategories();
      cachedCategories = data;
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const retry = useCallback(() => {
    cachedCategories = null;
    fetch();
  }, [fetch]);

  return { categories, isLoading, error, retry };
}
