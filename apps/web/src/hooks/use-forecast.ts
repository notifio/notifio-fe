'use client';

import { useQuery } from '@tanstack/react-query';

import type { ForecastData } from '@notifio/api-client';

import { api } from '@/lib/api';

const DEFAULT_STALE_MS = 15 * 60_000;

interface UseForecastOpts {
  hours?: number;
  days?: number;
  enabled?: boolean;
}

/**
 * Hourly + daily forecast for the supplied coordinates. 15-minute
 * stale (half of BE's 10-min cache TTL — keeps UI within fresh window
 * without thrashing). refetchOnWindowFocus enabled per audit Phase 4.
 */
export function useForecast(
  center: { lat: number; lng: number } | null,
  opts: UseForecastOpts = {},
) {
  const hours = opts.hours ?? 24;
  const days = opts.days ?? 7;
  const query = useQuery<ForecastData>({
    queryKey: ['forecast', center?.lat, center?.lng, hours, days],
    queryFn: () => api.getForecast(center!.lat, center!.lng, hours, days),
    enabled: !!center && (opts.enabled ?? true),
    staleTime: DEFAULT_STALE_MS,
    refetchOnWindowFocus: true,
  });

  return {
    forecast: query.data ?? null,
    isLoading: query.isPending,
    isError: query.isError,
    refetch: query.refetch,
  };
}
