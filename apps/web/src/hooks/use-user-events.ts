'use client';

import { useCallback } from 'react';

import type { UserEvent, UpdateUserEventBody } from '@notifio/api-client';

import { api } from '@/lib/api';

import { useApiQuery } from './use-api-query';

export function useUserEvents() {
  const { data, isLoading, error, refetch } = useApiQuery<UserEvent[]>(
    () => api.getUserEvents(),
    [],
  );

  const updateEvent = useCallback(async (eventId: string, body: UpdateUserEventBody) => {
    await api.updateEvent(eventId, body);
    await refetch();
  }, [refetch]);

  return {
    events: data ?? [],
    isLoading,
    error,
    updateEvent,
    refetch,
  };
}
