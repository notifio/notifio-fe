'use client';

import { useCallback, useEffect, useState } from 'react';

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

let cached: { todayNames: string[]; upcomingNames: UpcomingDay[]; country: string } | null = null;
let cachedDate: string | null = null;

function todayKey(): string {
  return new Date().toDateString();
}

export function useNameday(coords: { lat: number; lng: number } | null): UseNamedayResult {
  const lat = coords?.lat ?? null;
  const lng = coords?.lng ?? null;
  const isCacheValid = cachedDate === todayKey() && cached !== null;

  const [state, setState] = useState<UseNamedayResult>({
    todayNames: isCacheValid ? cached!.todayNames : [],
    upcomingNames: isCacheValid ? cached!.upcomingNames : [],
    country: isCacheValid ? cached!.country : null,
    isLoading: !isCacheValid,
  });

  const fetchNameday = useCallback(async () => {
    if (lat === null || lng === null) {
      setState({ todayNames: [], upcomingNames: [], country: null, isLoading: false });
      return;
    }

    const today = todayKey();
    if (cachedDate === today && cached) {
      setState({ ...cached, isLoading: false });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const data = await api.getNameday({
        lat,
        lng,
        upcoming: 1,
      });

      const result = {
        todayNames: data.today.names,
        upcomingNames: data.upcoming ?? [],
        country: data.country,
      };

      cached = result;
      cachedDate = today;
      setState({ ...result, isLoading: false });
    } catch (err) {
      // 404 COUNTRY_UNSUPPORTED — silently hide the card
      if (err instanceof ApiError && err.status === 404) {
        cached = { todayNames: [], upcomingNames: [], country: '' };
        cachedDate = today;
      }
      setState({ todayNames: [], upcomingNames: [], country: null, isLoading: false });
    }
  }, [lat, lng]);

  useEffect(() => {
    fetchNameday();
  }, [fetchNameday]);

  return state;
}
