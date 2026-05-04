import {
  alertTypeColors,
  darkColors,
  lightColors,
  severityColors,
  sharedColors,
  tierColors,
} from '@notifio/ui';

// Re-export raw palettes for I3 dark mode support
export { darkColors, lightColors, sharedColors, tierColors };

// Minimal stubs for theme-provider.tsx (will be properly built in I3)
export type ThemeColors = Record<
  keyof typeof lightColors | keyof typeof sharedColors | keyof typeof tierColors,
  string
>;

export function getColors(isDark: boolean): ThemeColors {
  return {
    ...(isDark ? darkColors : lightColors),
    ...sharedColors,
    ...tierColors,
  };
}

export const theme = {
  colors: {
    primary: sharedColors.accent,
    primaryDark: sharedColors.accentHover,
    background: lightColors.background,
    surface: lightColors.card,
    border: lightColors.border,
    text: lightColors.textPrimary,
    textSecondary: lightColors.textSecondary,
    textMuted: lightColors.muted,
    textInverse: '#FFFFFF',
    danger: sharedColors.danger,
    severity: {
      info: { bg: '#EFF6FF', text: severityColors.info, border: '#BFDBFE' },
      warning: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
      critical: { bg: '#FEF2F2', text: severityColors.critical, border: '#FECACA' },
    },
    alertType: {
      weather: { icon: alertTypeColors.weather, bg: '#F0F9FF' },
      traffic: { icon: alertTypeColors.traffic, bg: '#FFF7ED' },
      air_quality: { icon: alertTypeColors.air_quality, bg: '#ECFDF5' },
      utility_outage: { icon: alertTypeColors.utility_outage, bg: '#F5F3FF' },
      event: { icon: alertTypeColors.event, bg: '#FDF2F8' },
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 48,
  },
  radius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  font: {
    regular: { fontWeight: '400' as const },
    medium: { fontWeight: '500' as const },
    semibold: { fontWeight: '600' as const },
    bold: { fontWeight: '700' as const },
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
  },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
} as const;

/**
 * Append an alpha channel to a 6-digit hex color. Returns the input
 * unchanged if it isn't a 6-digit hex string (rgba inputs and named
 * colors must be pre-converted by the caller).
 *
 *   withOpacity('#FF7A2F', 0.18) → '#ff7a2f2e'
 *   withOpacity('#1D9E75', 0.2)  → '#1d9e7533'
 *
 * Output suffix is lowercase to match the original inline definitions
 * in weather-card.tsx / aqi-indicator.tsx.
 */
export function withOpacity(hexColor: string, opacity: number): string {
  if (!hexColor.startsWith('#') || hexColor.length !== 7) {
    if (__DEV__) console.warn(`[withOpacity] expected 6-digit hex, got: ${hexColor}`);
    return hexColor;
  }
  const a = Math.round(Math.max(0, Math.min(1, opacity)) * 255);
  const aHex = a.toString(16).padStart(2, '0');
  return `${hexColor}${aHex}`;
}
