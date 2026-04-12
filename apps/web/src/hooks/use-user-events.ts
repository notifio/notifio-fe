'use client';

import { useCallback, useEffect, useState } from 'react';

import type { UserEvent, UpdateUserEventBody } from '@notifio/api-client';

import { api } from '@/lib/api';

interface UseUserEventsResult {
  events: UserEvent[];
  loading: boolean;
  error: string | null;
  updateEvent: (eventId: string, body: UpdateUserEventBody) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useUserEvents(): UseUserEventsResult {
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUserEvents();
      setEvents(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load events';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const updateEvent = useCallback(async (eventId: string, body: UpdateUserEventBody) => {
    const updated = await api.updateEvent(eventId, body);
    setEvents((prev) => prev.map((e) => (e.eventId === eventId ? updated : e)));
  }, []);

  return {
    events,
    loading,
    error,
    updateEvent,
    refetch: fetchEvents,
  };
}
