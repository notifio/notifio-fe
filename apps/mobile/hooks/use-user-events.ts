import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import type { UpdateUserEventBody, UserEvent } from '@notifio/api-client';

import { api } from '../lib/api';

interface UseUserEventsResult {
  events: UserEvent[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateEvent: (eventId: string, body: UpdateUserEventBody) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
}

/**
 * Fetches the current user's reported events from /events/mine.
 * Mirrors web's apps/web/src/hooks/use-user-events.ts surface (data
 * + loading + error + manual refresh + update/delete mutations).
 * Used by the Notifications Events tab for inline resolve/delete
 * actions on each row.
 *
 * Mutations call the API directly then `refetch()` to repopulate the
 * cache — simpler than `useMutation` since consumers don't observe
 * mutation pending state. Returns `Promise<void>` from `refresh` so
 * callers that await it (sequencing patterns) keep working.
 */
export function useUserEvents(): UseUserEventsResult {
  const query = useQuery<UserEvent[]>({
    queryKey: ['user-events'],
    queryFn: () => api.getUserEvents(),
  });

  const refresh = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const updateEvent = useCallback(
    async (eventId: string, body: UpdateUserEventBody) => {
      await api.updateEvent(eventId, body);
      await query.refetch();
    },
    [query],
  );

  const deleteEvent = useCallback(
    async (eventId: string) => {
      await api.deleteEvent(eventId);
      await query.refetch();
    },
    [query],
  );

  return {
    events: query.data ?? [],
    isLoading: query.isPending,
    error: query.error ? (query.error.message || 'Failed to load events') : null,
    refresh,
    updateEvent,
    deleteEvent,
  };
}
