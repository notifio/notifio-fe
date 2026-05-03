import { useCallback, useEffect, useState } from 'react';

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
 */
export function useUserEvents(): UseUserEventsResult {
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getUserEvents();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateEvent = useCallback(
    async (eventId: string, body: UpdateUserEventBody) => {
      await api.updateEvent(eventId, body);
      await load();
    },
    [load],
  );

  const deleteEvent = useCallback(
    async (eventId: string) => {
      await api.deleteEvent(eventId);
      await load();
    },
    [load],
  );

  return { events, isLoading, error, refresh: load, updateEvent, deleteEvent };
}
