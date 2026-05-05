import { useQuery } from '@tanstack/react-query';

import type { UserEventCategory } from '@notifio/api-client';

import { api } from '../lib/api';

interface UseEventCategoriesResult {
  categories: UserEventCategory[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Cached event categories list. Module-level `cachedCategories` is
 * replaced by RQ — `retry` triggers a forced refetch which bypasses
 * `staleTime` and refires the network call.
 */
export function useEventCategories(): UseEventCategoriesResult {
  const query = useQuery<UserEventCategory[]>({
    queryKey: ['event-categories'],
    queryFn: () => api.getEventCategories(),
  });

  return {
    categories: query.data ?? [],
    isLoading: query.isPending,
    error: query.error ? (query.error.message || 'Failed to load categories') : null,
    retry: () => {
      void query.refetch();
    },
  };
}
