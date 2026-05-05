'use client';

import { useQuery } from '@tanstack/react-query';

import { ApiError } from '@notifio/api-client';

import { api } from '@/lib/api';

interface UpcomingDay {
  date: string;
  names: string[];
}

interface UseNamedayResult {
  todayNames: string[];
  upcomingNames: UpcomingDay[];
  country: string | null;
  isLoading: boolean;
}

interface NamedayCacheShape {
  todayNames: string[];
  upcomingNames: UpcomingDay[];
  country: string;
}

const EMPTY_CACHE: NamedayCacheShape = { todayNames: [], upcomingNames: [], country: '' };

function todayKey(): string {
  return new Date().toDateString();
}

/**
 * Nameday lookup. Module-level today-keyed cache (`cached`/`cachedDate`)
 * replaced by RQ — `todayKey()` baked into the queryKey naturally
 * invalidates on day rollover.
 *
 * 404 COUNTRY_UNSUPPORTED responses get caught inside `queryFn` and
 * resolved to an empty cache shape so the UI hides the card silently
 * (matches prior behaviour). Non-404 errors propagate to `query.error`.
 */
export function useNameday(coords: { lat: number; lng: number } | null): UseNamedayResult {
  const lat = coords?.lat ?? null;
  const lng = coords?.lng ?? null;

  const query = useQuery<NamedayCacheShape>({
    queryKey: ['nameday', lat, lng, todayKey()],
    queryFn: async () => {
      if (lat === null || lng === null) return EMPTY_CACHE;
      try {
        const data = await api.getNameday({ lat, lng, upcoming: 1 });
        return {
          todayNames: data.today.names,
          upcomingNames: data.upcoming ?? [],
          country: data.country,
        };
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          return EMPTY_CACHE;
        }
        throw err;
      }
    },
    enabled: lat !== null && lng !== null,
  });

  const data = query.data ?? EMPTY_CACHE;
  return {
    todayNames: data.todayNames,
    upcomingNames: data.upcomingNames,
    country: data.country || null,
    isLoading: query.isPending && lat !== null && lng !== null,
  };
}
