'use client';

import { useCallback, useEffect, useState } from 'react';

import type { DigestPreferences } from '@notifio/api-client';

import { api } from '@/lib/api';

const DEFAULT_PREFS: DigestPreferences = { realTime: true, morning: false, evening: false };

interface UseDigestPreferencesResult {
  prefs: DigestPreferences;
  loading: boolean;
  saving: boolean;
  updatePrefs: (next: DigestPreferences) => Promise<void>;
}

export function useDigestPreferences(): UseDigestPreferencesResult {
  const [prefs, setPrefs] = useState<DigestPreferences>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getProfile()
      .then((profile) => {
        const dp = (profile as unknown as { digestPreferences?: DigestPreferences }).digestPreferences;
        if (dp && typeof dp === 'object') {
          setPrefs({
            realTime: Boolean(dp.realTime),
            morning: Boolean(dp.morning),
            evening: Boolean(dp.evening),
          });
        }
      })
      .catch(() => {
        // Keep defaults
      })
      .finally(() => setLoading(false));
  }, []);

  const updatePrefs = useCallback(async (next: DigestPreferences) => {
    const previous = prefs;
    setPrefs(next);
    setSaving(true);
    try {
      await api.updateProfile({ digestPreferences: next });
    } catch {
      setPrefs(previous);
    } finally {
      setSaving(false);
    }
  }, [prefs]);

  return { prefs, loading, saving, updatePrefs };
}
