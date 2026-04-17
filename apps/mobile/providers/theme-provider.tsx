import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useColorScheme } from 'react-native';

import {
  alertTypeColors,
  alertTypeTints,
  darkColors,
  lightColors,
  severityColors,
  severityTints,
  sharedColors,
} from '@notifio/ui';

import { theme } from '../lib/theme';

// ── Types ──────────────────────────────────────────────────────────

export type ThemeMode = 'system' | 'light' | 'dark';

interface SeverityStyle {
  bg: string;
  text: string;
  border: string;
}

interface AlertTypeStyle {
  icon: string;
  bg: string;
}

export interface ResolvedColors {
  primary: string;
  primaryDark: string;
  background: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  danger: string;
  severity: {
    info: SeverityStyle;
    warning: SeverityStyle;
    critical: SeverityStyle;
  };
  alertType: {
    weather: AlertTypeStyle;
    traffic: AlertTypeStyle;
    air_quality: AlertTypeStyle;
    utility_outage: AlertTypeStyle;
    event: AlertTypeStyle;
  };
}

interface ThemeContextValue {
  colors: ResolvedColors;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
}

// ── Constants ──────────────────────────────────────────────────────

const STORAGE_KEY = 'notifio_theme_mode';

// ── Color builder ──────────────────────────────────────────────────

function buildColors(isDark: boolean): ResolvedColors {
  const base = isDark ? darkColors : lightColors;
  const tintMode = isDark ? 'dark' : 'light';

  return {
    primary: sharedColors.accent,
    primaryDark: sharedColors.accentHover,
    background: base.background,
    surface: base.card,
    border: base.border,
    text: base.textPrimary,
    textSecondary: base.textSecondary,
    textMuted: base.muted,
    textInverse: isDark ? '#0E223F' : '#FFFFFF',
    danger: sharedColors.danger,
    severity: {
      info: {
        bg: severityTints[tintMode].info.bg,
        text: severityColors.info,
        border: severityTints[tintMode].info.border,
      },
      warning: {
        bg: severityTints[tintMode].warning.bg,
        text: '#D97706',
        border: severityTints[tintMode].warning.border,
      },
      critical: {
        bg: severityTints[tintMode].critical.bg,
        text: severityColors.critical,
        border: severityTints[tintMode].critical.border,
      },
    },
    alertType: {
      weather: { icon: alertTypeColors.weather, bg: alertTypeTints[tintMode].weather },
      traffic: { icon: alertTypeColors.traffic, bg: alertTypeTints[tintMode].traffic },
      air_quality: { icon: alertTypeColors.air_quality, bg: alertTypeTints[tintMode].air_quality },
      utility_outage: { icon: alertTypeColors.utility_outage, bg: alertTypeTints[tintMode].utility_outage },
      event: { icon: alertTypeColors.event, bg: alertTypeTints[tintMode].event },
    },
  };
}

// ── Context ────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const hasHydrated = useRef(false);

  // Read persisted mode on mount — updates silently without unmounting children
  useEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setModeState(stored);
      }
    });
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(STORAGE_KEY, newMode);
  }, []);

  const isDark = useMemo(() => {
    if (mode === 'dark') return true;
    if (mode === 'light') return false;
    return systemScheme === 'dark';
  }, [mode, systemScheme]);

  const colors = useMemo(() => buildColors(isDark), [isDark]);

  const value = useMemo<ThemeContextValue>(
    () => ({ colors, mode, isDark, setMode }),
    [colors, mode, isDark, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ── Hooks ──────────────────────────────────────────────────────────

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback for components rendered outside provider (e.g., tests)
    return {
      colors: buildColors(false),
      mode: 'system',
      isDark: false,
      setMode: () => {},
    };
  }
  return ctx;
}

export function useIsDark(): boolean {
  return useAppTheme().isDark;
}

// Re-export static layout tokens for convenience
export { theme };
