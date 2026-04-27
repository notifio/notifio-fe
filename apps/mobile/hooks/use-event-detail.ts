import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { EventDetail, UserVote } from '@notifio/api-client';
import { ApiError } from '@notifio/api-client';

import { api } from '../lib/api';
import { showToast } from '../lib/toast';

// Module-level cache for user's events (ownership check)
let cachedUserEventIds: Set<string> | null = null;

interface UseEventDetailResult {
  event: EventDetail | null;
  userVote: UserVote | null;
  isOwner: boolean;
  isLoading: boolean;
  error: string | null;
  voting: boolean;
  vote: (isValid: boolean) => Promise<void>;
  resolveEvent: () => Promise<boolean>;
  removeEvent: () => Promise<boolean>;
}

export function useEventDetail(eventId: string): UseEventDetailResult {
  const { t } = useTranslation();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [userVote, setUserVote] = useState<UserVote | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [eventData, voteData] = await Promise.all([
          api.getEventDetail(eventId),
          api.getUserVote(eventId).catch(() => ({ voted: false }) as UserVote),
        ]);
        if (cancelled) return;
        setEvent(eventData);
        setUserVote(voteData);

        // Check ownership from cache or fetch
        if (cachedUserEventIds) {
          setIsOwner(cachedUserEventIds.has(eventId));
        } else {
          try {
            const myEvents = await api.getUserEvents();
            cachedUserEventIds = new Set(myEvents.map((e) => e.eventId));
            if (!cancelled) setIsOwner(cachedUserEventIds.has(eventId));
          } catch {
            // Not authenticated or failed
          }
        }
      } catch {
        if (!cancelled) setError('Failed to load event');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [eventId]);

  const vote = useCallback(async (isValid: boolean) => {
    if (voting || userVote?.voted) return;
    setVoting(true);
    try {
      await api.voteOnEvent(eventId, isValid);
      setUserVote({ voted: true, isValid });
      const updated = await api.getEventDetail(eventId);
      if (mountedRef.current) setEvent(updated);
      showToast.success(t('eventDetail.vote.voted'));
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setUserVote({ voted: true, isValid });
        showToast.info(t('eventDetail.vote.alreadyVoted'));
      } else {
        showToast.error(t('eventDetail.vote.error'));
      }
    } finally {
      if (mountedRef.current) setVoting(false);
    }
  }, [eventId, voting, userVote, t]);

  const resolveEvent = useCallback(async (): Promise<boolean> => {
    try {
      await api.updateEvent(eventId, { resolved: true });
      showToast.success(t('eventDetail.owner.resolved'));
      return true;
    } catch {
      showToast.error(t('eventDetail.owner.error'));
      return false;
    }
  }, [eventId, t]);

  const removeEvent = useCallback(async (): Promise<boolean> => {
    try {
      await api.deleteEvent(eventId);
      cachedUserEventIds?.delete(eventId);
      showToast.success(t('eventDetail.owner.deleted'));
      return true;
    } catch {
      showToast.error(t('eventDetail.owner.error'));
      return false;
    }
  }, [eventId, t]);

  return { event, userVote, isOwner, isLoading, error, voting, vote, resolveEvent, removeEvent };
}
