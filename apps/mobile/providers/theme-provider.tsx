import { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { type ThemeColors, getColors, theme } from '../lib/theme';

type ThemeMode = 'system' | 'light' | 'dark';

interface AppTheme {
  colors: ThemeColors;
  isDark: boolean;
  spacing: typeof theme.spacing;
  radius: typeof theme.radius;
  font: typeof theme.font;
  fontSize: typeof theme.fontSize;
}

interface ThemeContextValue {
  theme: AppTheme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  mode?: ThemeMode;
  children: React.ReactNode;
}

export function ThemeProvider({ mode = 'system', children }: ThemeProviderProps) {
  const systemScheme = useColorScheme();

  const isDark = useMemo(() => {
    if (mode === 'dark') return true;
    if (mode === 'light') return false;
    return systemScheme === 'dark';
  }, [mode, systemScheme]);

  const value = useMemo<ThemeContextValue>(() => ({
    isDark,
    theme: {
      colors: getColors(isDark),
      isDark,
      spacing: theme.spacing,
      radius: theme.radius,
      font: theme.font,
      fontSize: theme.fontSize,
    },
  }), [isDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): AppTheme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback for components rendered outside provider (e.g., during tests)
    return {
      colors: getColors(false),
      isDark: false,
      spacing: theme.spacing,
      radius: theme.radius,
      font: theme.font,
      fontSize: theme.fontSize,
    };
  }
  return ctx.theme;
}

export function useIsDark(): boolean {
  const ctx = useContext(ThemeContext);
  return ctx?.isDark ?? false;
}
