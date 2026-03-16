'use client';

import { useCallback, useState } from 'react';

import type { AlertType } from '@/lib/mock-data';

interface Preferences {
  alertTypes: AlertType[];
  minSeverity: 'info' | 'warning' | 'critical';
  locale: 'en' | 'sk';
}

const ALL_ALERT_TYPES: AlertType[] = ['weather', 'traffic', 'air_quality', 'utility_outage', 'event'];

const DEFAULT_PREFERENCES: Preferences = {
  alertTypes: [...ALL_ALERT_TYPES],
  minSeverity: 'info',
  locale: 'en',
};

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);

  const toggleAlertType = useCallback((type: AlertType) => {
    setPreferences((prev) => ({
      ...prev,
      alertTypes: prev.alertTypes.includes(type)
        ? prev.alertTypes.filter((t) => t !== type)
        : [...prev.alertTypes, type],
    }));
  }, []);

  const setMinSeverity = useCallback((severity: Preferences['minSeverity']) => {
    setPreferences((prev) => ({ ...prev, minSeverity: severity }));
  }, []);

  const setLocale = useCallback((locale: Preferences['locale']) => {
    setPreferences((prev) => ({ ...prev, locale }));
  }, []);

  return { preferences, toggleAlertType, setMinSeverity, setLocale };
}
