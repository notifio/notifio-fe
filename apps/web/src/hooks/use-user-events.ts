'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import type { UserEvent, UpdateUserEventBody } from '@notifio/api-client';

import { api } from '@/lib/api';

export function useUserEvents() {
  const query = useQuery<UserEvent[]>({
    queryKey: ['user-events'],
    queryFn: () => api.getUserEvents(),
  });

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const updateEvent = useCallback(
    async (eventId: string, body: UpdateUserEventBody) => {
      await api.updateEvent(eventId, body);
      await query.refetch();
    },
    [query],
  );

  return {
    events: query.data ?? [],
    isLoading: query.isPending,
    error: query.error ? (query.error.message || 'Failed to load events') : null,
    updateEvent,
    refetch,
  };
}
