'use client';

import { useQuery } from '@tanstack/react-query';

import type { EventFeedItem } from '@notifio/api-client';

import { api } from '@/lib/api';

const EVENT_RADIUS = 20_000;
const DEFAULT_STALE_MS = 60_000;

interface UseEventsFeedOpts {
  enabled?: boolean;
  staleTime?: number;
  radius?: number;
}

/**
 * Web mirror of apps/mobile/hooks/use-events-feed.ts. Same signature,
 * same query key, same staleness. Used by the dashboard sidebar to
 * render the SAME data set as the map (`/events`) instead of the
 * per-user push delivery history (`/me/notifications`) which was the
 * empty-sidebar bug.
 *
 * The `/notifications` route keeps `useNotificationHistory` — that
 * page is intentionally a push-delivery log, not a geo-proximity feed.
 */
export function useEventsFeed(
  center: { lat: number; lng: number } | null,
  opts: UseEventsFeedOpts = {},
) {
  const radius = opts.radius ?? EVENT_RADIUS;
  const query = useQuery({
    queryKey: ['events-feed', center?.lat, center?.lng, radius],
    queryFn: () =>
      api.getEvents({ lat: center!.lat, lng: center!.lng, radius }),
    enabled: !!center && (opts.enabled ?? true),
    staleTime: opts.staleTime ?? DEFAULT_STALE_MS,
    refetchOnWindowFocus: true,
  });

  return {
    events: (query.data?.events ?? []) as EventFeedItem[],
    isLoading: query.isPending,
    isError: query.isError,
    refetch: query.refetch,
  };
}
