'use client';

import { useQuery } from '@tanstack/react-query';

import type { ForecastData } from '@notifio/api-client';

import { api } from '@/lib/api';

const DEFAULT_STALE_MS = 15 * 60_000;

interface UseForecastOpts {
  hours?: number;
  days?: number;
  enabled?: boolean;
  staleTime?: number;
}

/**
 * Web mirror of mobile's use-forecast hook. 15-minute stale (half of BE
 * cache TTL). Returns the full ForecastData blob (hourly + daily).
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
    staleTime: opts.staleTime ?? DEFAULT_STALE_MS,
  });

  return {
    forecast: query.data ?? null,
    isLoading: query.isPending,
    isError: query.isError,
    refetch: query.refetch,
  };
}
