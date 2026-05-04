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
  /**
   * @deprecated Sprint 2 (B3 split). Calls `toggleSendNotifications` for
   * compatibility with screens that haven't migrated to the two-toggle
   * model yet.
   */
  toggleItem: (categoryCode: string, subcategoryCode: string | null, enabled: boolean) => void;
  /** @deprecated Sprint 2: prefer `toggleCategorySend` / `toggleCategoryShow`. */
  toggleCategory: (categoryCode: string, enabled: boolean) => void;
  /** Sprint 2 / B3: toggle push delivery for one item (subcategory-level). */
  toggleSendNotifications: (categoryCode: string, subcategoryCode: string | null, value: boolean) => void;
  /** Sprint 2 / B3: toggle map pin visibility for one item (subcategory-level). */
  toggleShowOnMap: (categoryCode: string, subcategoryCode: string | null, value: boolean) => void;
  /** Sprint 2 / B3: bulk toggle every item under a category for either axis. */
  toggleCategorySend: (categoryCode: string, value: boolean) => void;
  toggleCategoryShow: (categoryCode: string, value: boolean) => void;
  /** Sprint 2: global quiet hours (PRO-gated). Pass `null` start+end to clear. */
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

  const toggleSendNotifications = useCallback(
    (categoryCode: string, subcategoryCode: string | null, value: boolean) => {
      updateItems(categoryCode, subcategoryCode, (item) => {
        item.sendNotifications = value;
        item.enabled = value; // backwards-compat shim
      });
    },
    [updateItems],
  );

  const toggleShowOnMap = useCallback(
    (categoryCode: string, subcategoryCode: string | null, value: boolean) => {
      updateItems(categoryCode, subcategoryCode, (item) => {
        item.showOnMap = value;
      });
    },
    [updateItems],
  );

  const toggleCategorySend = useCallback(
    (categoryCode: string, value: boolean) => {
      updateItems(categoryCode, 'ANY', (item) => {
        item.sendNotifications = value;
        item.enabled = value;
      });
    },
    [updateItems],
  );

  const toggleCategoryShow = useCallback(
    (categoryCode: string, value: boolean) => {
      updateItems(categoryCode, 'ANY', (item) => {
        item.showOnMap = value;
      });
    },
    [updateItems],
  );

  const toggleItem = useCallback(
    (categoryCode: string, subcategoryCode: string | null, enabled: boolean) => {
      // Pre-Sprint-2 callers — route through toggleSendNotifications so
      // the shim keeps single-toggle screens working until they migrate.
      toggleSendNotifications(categoryCode, subcategoryCode, enabled);
    },
    [toggleSendNotifications],
  );

  const toggleCategory = useCallback(
    (categoryCode: string, enabled: boolean) => {
      toggleCategorySend(categoryCode, enabled);
    },
    [toggleCategorySend],
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
        sendNotifications: boolean;
        showOnMap: boolean;
      }> = [];

      for (const localCat of localPrefs.notifications) {
        const serverCat = serverPrefs.notifications.find((c) => c.categoryCode === localCat.categoryCode);
        for (const localItem of localCat.items) {
          const serverItem = serverCat?.items.find(
            (i) => i.categoryCode === localItem.categoryCode && i.subcategoryCode === localItem.subcategoryCode,
          );
          const sendChanged = !serverItem || serverItem.sendNotifications !== localItem.sendNotifications;
          const showChanged = !serverItem || serverItem.showOnMap !== localItem.showOnMap;
          if (sendChanged || showChanged) {
            changedNotifications.push({
              categoryCode: localItem.categoryCode,
              subcategoryCode: localItem.subcategoryCode,
              sendNotifications: localItem.sendNotifications,
              showOnMap: localItem.showOnMap,
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
    toggleSendNotifications,
    toggleShowOnMap,
    toggleCategorySend,
    toggleCategoryShow,
    setQuietHours,
    setDisplay,
    savePreferences,
    cancelChanges,
    refresh: fetchPrefs,
  };
}
