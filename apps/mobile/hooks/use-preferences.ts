import { useCallback, useEffect, useMemo, useState } from 'react';

import type { UserPreferencesResponse } from '@notifio/api-client';

import { api } from '../lib/api';

function clonePrefs(p: UserPreferencesResponse): UserPreferencesResponse {
  return JSON.parse(JSON.stringify(p)) as UserPreferencesResponse;
}

interface UsePreferencesResult {
  preferences: UserPreferencesResponse | null;
  isLoading: boolean;
  saving: boolean;
  error: string | null;
  hasChanges: boolean;
  /** Toggle one item (subcategory or category-default row). */
  toggleItem: (categoryCode: string, subcategoryCode: string | null, enabled: boolean) => void;
  /** Bulk toggle every item under a category. */
  toggleCategory: (categoryCode: string, enabled: boolean) => void;
  /** Global quiet hours (PRO-gated). Pass `null` start+end to clear. */
  setQuietHours: (start: string | null, end: string | null) => void;
  setDisplay: (key: 'theme' | 'units' | 'weatherProvider', value: string) => void;
  savePreferences: () => Promise<void>;
  cancelChanges: () => void;
  refresh: () => void;
}

export function usePreferences(): UsePreferencesResult {
  const [serverPrefs, setServerPrefs] = useState<UserPreferencesResponse | null>(null);
  const [localPrefs, setLocalPrefs] = useState<UserPreferencesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrefs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getPreferences();
      setServerPrefs(data);
      setLocalPrefs(clonePrefs(data));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load preferences';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrefs();
  }, [fetchPrefs]);

  const hasChanges = useMemo(() => {
    if (!serverPrefs || !localPrefs) return false;
    return JSON.stringify(serverPrefs) !== JSON.stringify(localPrefs);
  }, [serverPrefs, localPrefs]);

  const updateItems = useCallback(
    (
      categoryCode: string,
      subcategoryCode: string | null | 'ANY',
      mutator: (item: UserPreferencesResponse['notifications'][number]['items'][number]) => void,
    ) => {
      setLocalPrefs((prev) => {
        if (!prev) return prev;
        const next = clonePrefs(prev);
        for (const cat of next.notifications) {
          if (cat.categoryCode !== categoryCode) continue;
          for (const item of cat.items) {
            if (subcategoryCode === 'ANY' || item.subcategoryCode === subcategoryCode) {
              mutator(item);
            }
          }
        }
        return next;
      });
    },
    [],
  );

  const toggleItem = useCallback(
    (categoryCode: string, subcategoryCode: string | null, enabled: boolean) => {
      updateItems(categoryCode, subcategoryCode, (item) => {
        item.enabled = enabled;
      });
    },
    [updateItems],
  );

  const toggleCategory = useCallback(
    (categoryCode: string, enabled: boolean) => {
      updateItems(categoryCode, 'ANY', (item) => {
        item.enabled = enabled;
      });
    },
    [updateItems],
  );

  const setQuietHours = useCallback((start: string | null, end: string | null) => {
    setLocalPrefs((prev) => {
      if (!prev) return prev;
      const next = clonePrefs(prev);
      next.quietHours = { start, end };
      return next;
    });
  }, []);

  const setDisplay = useCallback((key: 'theme' | 'units' | 'weatherProvider', value: string) => {
    setLocalPrefs((prev) => {
      if (!prev) return prev;
      const next = clonePrefs(prev);
      next.display = { ...next.display, [key]: value };
      return next;
    });
  }, []);

  const savePreferences = useCallback(async () => {
    if (!serverPrefs || !localPrefs) return;
    setSaving(true);
    setError(null);
    try {
      const displayChanged = JSON.stringify(serverPrefs.display) !== JSON.stringify(localPrefs.display);
      const quietHoursChanged =
        JSON.stringify(serverPrefs.quietHours) !== JSON.stringify(localPrefs.quietHours);

      const changedNotifications: Array<{
        categoryCode: string;
        subcategoryCode: string | null;
        enabled: boolean;
      }> = [];

      for (const localCat of localPrefs.notifications) {
        const serverCat = serverPrefs.notifications.find((c) => c.categoryCode === localCat.categoryCode);
        for (const localItem of localCat.items) {
          const serverItem = serverCat?.items.find(
            (i) => i.categoryCode === localItem.categoryCode && i.subcategoryCode === localItem.subcategoryCode,
          );
          if (!serverItem || serverItem.enabled !== localItem.enabled) {
            changedNotifications.push({
              categoryCode: localItem.categoryCode,
              subcategoryCode: localItem.subcategoryCode,
              enabled: localItem.enabled,
            });
          }
        }
      }

      const request: Parameters<typeof api.updatePreferences>[0] = {};
      if (displayChanged) {
        request.display = {
          weatherProvider: localPrefs.display.weatherProvider as 'auto' | 'openweathermap' | 'open-meteo',
          theme: localPrefs.display.theme as 'system' | 'light' | 'dark',
          units: localPrefs.display.units as 'metric' | 'imperial',
        };
      }
      if (quietHoursChanged) {
        request.quietHours = localPrefs.quietHours;
      }
      if (changedNotifications.length > 0) {
        request.notifications = changedNotifications;
      }

      const updated = await api.updatePreferences(request);
      setServerPrefs(updated);
      setLocalPrefs(clonePrefs(updated));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save preferences';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }, [serverPrefs, localPrefs]);

  const cancelChanges = useCallback(() => {
    if (serverPrefs) {
      setLocalPrefs(clonePrefs(serverPrefs));
    }
    setError(null);
  }, [serverPrefs]);

  return {
    preferences: localPrefs,
    isLoading,
    saving,
    error,
    hasChanges,
    toggleItem,
    toggleCategory,
    setQuietHours,
    setDisplay,
    savePreferences,
    cancelChanges,
    refresh: fetchPrefs,
  };
}
