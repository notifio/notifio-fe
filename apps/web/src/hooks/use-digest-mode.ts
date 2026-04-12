'use client';

import { useCallback, useEffect, useState } from 'react';

import type { DigestMode } from '@notifio/api-client';

import { api } from '@/lib/api';

interface UseDigestModeResult {
  digestMode: DigestMode;
  loading: boolean;
  saving: boolean;
  updateDigestMode: (mode: DigestMode) => Promise<void>;
}

export function useDigestMode(): UseDigestModeResult {
  const [digestMode, setDigestMode] = useState<DigestMode>('REAL_TIME');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getProfile()
      .then((profile) => {
        const mode = (profile as unknown as { digestMode?: string }).digestMode;
        if (mode === 'REAL_TIME' || mode === 'MORNING' || mode === 'EVENING' || mode === 'BOTH') {
          setDigestMode(mode);
        }
      })
      .catch(() => {
        // Keep default REAL_TIME
      })
      .finally(() => setLoading(false));
  }, []);

  const updateDigestMode = useCallback(async (mode: DigestMode) => {
    const previous = digestMode;
    setDigestMode(mode);
    setSaving(true);
    try {
      await api.updateProfile({ digestMode: mode });
    } catch {
      setDigestMode(previous);
    } finally {
      setSaving(false);
    }
  }, [digestMode]);

  return { digestMode, loading, saving, updateDigestMode };
}
