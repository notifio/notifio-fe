'use client';

import { useQuery } from '@tanstack/react-query';

import type { UserEventCategory } from '@notifio/api-client';

import { api } from '@/lib/api';

interface UseEventCategoriesResult {
  categories: UserEventCategory[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Event-category list. Module-level `cachedCategories` replaced by RQ
 * — `retry` triggers a forced refetch which bypasses `staleTime`.
 *
 * Note: the consumer-facing field is `loading` (not `isLoading`) — this
 * predates RQ; preserved verbatim so call sites don't churn.
 */
export function useEventCategories(): UseEventCategoriesResult {
  const query = useQuery<UserEventCategory[]>({
    queryKey: ['event-categories'],
    queryFn: () => api.getEventCategories(),
  });

  return {
    categories: query.data ?? [],
    loading: query.isPending,
    error: query.error ? (query.error.message || 'Failed to load categories') : null,
    retry: () => {
      void query.refetch();
    },
  };
}
