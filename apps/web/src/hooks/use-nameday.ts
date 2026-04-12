'use client';

import { useCallback, useEffect, useState } from 'react';

import { api } from '@/lib/api';

interface UseNamedayResult {
  name: string | null;
  loading: boolean;
}

let cachedName: string | null = null;
let cachedDate: string | null = null;

function todayKey(): string {
  return new Date().toDateString();
}

/**
 * Parse the nameday name from the event title.
 * BE titles look like "Meniny: Marek" or just "Marek".
 */
function parseName(title: string): string {
  const colonIdx = title.indexOf(':');
  if (colonIdx >= 0) return title.slice(colonIdx + 1).trim();
  return title.trim();
}

export function useNameday(coords: { lat: number; lng: number } | null): UseNamedayResult {
  const [name, setName] = useState<string | null>(cachedDate === todayKey() ? cachedName : null);
  const [loading, setLoading] = useState(cachedDate !== todayKey());

  const fetchNameday = useCallback(async () => {
    if (!coords) return;

    const today = todayKey();
    if (cachedDate === today) {
      setName(cachedName);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const events = await api.getEvents({ lat: coords.lat, lng: coords.lng, radius: 50000 });
      const raw = events as unknown as Array<Record<string, unknown>>;
      const namedayEvent = raw.find(
        (e) => (e.category === 'name_day' || e.categoryCode === 'name_day'),
      );

      const parsed = namedayEvent
        ? parseName((namedayEvent.typeName as string) ?? (namedayEvent.title as string) ?? '')
        : null;

      cachedName = parsed;
      cachedDate = today;
      setName(parsed);
    } catch {
      // Silently fail — nameday is non-critical
    } finally {
      setLoading(false);
    }
  }, [coords]);

  useEffect(() => {
    fetchNameday();
  }, [fetchNameday]);

  return { name, loading };
}
