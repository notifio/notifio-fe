'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { UserPreferencesResponse } from '@notifio/api-client';
import {
  clonePrefs,
  diffPreferences,
  setDisplayField,
  togglePreferenceCategory,
  togglePreferenceItem,
} from '@notifio/shared/preferences';

import { api } from '@/lib/api';

interface UsePreferencesResult {
  preferences: UserPreferencesResponse | null;
  isLoading: boolean;
  saving: boolean;
  error: string | null;
  hasChanges: boolean;
  toggleItem: (categoryCode: string, subcategoryCode: string | null, enabled: boolean) => void;
  toggleCategory: (categoryCode: string, enabled: boolean) => void;
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

  const toggleItem = useCallback((categoryCode: string, subcategoryCode: string | null, enabled: boolean) => {
    setLocalPrefs((prev) => (prev ? togglePreferenceItem(prev, categoryCode, subcategoryCode, enabled) : prev));
  }, []);

  const toggleCategory = useCallback((categoryCode: string, enabled: boolean) => {
    setLocalPrefs((prev) => (prev ? togglePreferenceCategory(prev, categoryCode, enabled) : prev));
  }, []);

  const setDisplay = useCallback((key: 'theme' | 'units' | 'weatherProvider', value: string) => {
    setLocalPrefs((prev) => (prev ? setDisplayField(prev, key, value) : prev));
  }, []);

  const savePreferences = useCallback(async () => {
    if (!serverPrefs || !localPrefs) return;
    setSaving(true);
    setError(null);
    try {
      const patch = diffPreferences(localPrefs, serverPrefs);
      const request: Parameters<typeof api.updatePreferences>[0] = {};
      if (patch.display) {
        request.display = {
          weatherProvider: patch.display.weatherProvider as 'auto' | 'openweathermap' | 'open-meteo',
          theme: patch.display.theme as 'system' | 'light' | 'dark',
          units: patch.display.units as 'metric' | 'imperial',
        };
      }
      if (patch.notifications) {
        request.notifications = patch.notifications;
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
    setDisplay,
    savePreferences,
    cancelChanges,
    refresh: fetchPrefs,
  };
}
