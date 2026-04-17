// ── Light mode palette ─────────────────────────────────────────────
export const lightColors = {
  background: '#FFFFFF',
  card: '#F5F7FA',
  border: '#E2E8F0',
  input: '#F5F7FA',
  textPrimary: '#0E223F',
  textSecondary: '#4A5568',
  muted: '#94A3B8',
} as const;

// ── Dark mode palette ──────────────────────────────────────────────
export const darkColors = {
  background: '#0E223F',
  card: '#162A4A',
  border: '#1F3A5F',
  input: '#0B1B32',
  textPrimary: '#FFFFFF',
  textSecondary: '#A8B3C7',
  muted: '#6B7A99',
} as const;

// ── Mode-independent colors ────────────────────────────────────────
export const sharedColors = {
  accent: '#FF7A2F',
  accentHover: '#E86A20',
  danger: '#FF3B30',
  info: '#3A86FF',
  success: '#34C759',
  warning: '#F59E0B',
} as const;

// ── Membership tier badges ─────────────────────────────────────────
export const tierColors = {
  free: '#5A6A85',
  plus: '#3A86FF',
  pro: '#FF7A2F',
} as const;

// ── Severity & alert-type semantic colors ──────────────────────────
export const severityColors = {
  info: '#3A86FF',
  warning: '#F59E0B',
  critical: '#FF3B30',
} as const;

export const alertTypeColors = {
  weather: '#0EA5E9',
  traffic: '#F97316',
  air_quality: '#10B981',
  utility_outage: '#8B5CF6',
  event: '#EC4899',
} as const;

// ── Severity & alert-type background/border tints (mode-dependent) ─
export const severityTints = {
  light: {
    info: { bg: '#EFF6FF', border: '#BFDBFE' },
    warning: { bg: '#FFFBEB', border: '#FDE68A' },
    critical: { bg: '#FEF2F2', border: '#FECACA' },
  },
  dark: {
    info: { bg: '#1A2A4A', border: '#2A3F6A' },
    warning: { bg: '#2A2415', border: '#4A3F2A' },
    critical: { bg: '#2A1A1A', border: '#4A2A2A' },
  },
} as const;

export const alertTypeTints = {
  light: {
    weather: '#F0F9FF',
    traffic: '#FFF7ED',
    air_quality: '#ECFDF5',
    utility_outage: '#F5F3FF',
    event: '#FDF2F8',
  },
  dark: {
    weather: '#1A2840',
    traffic: '#2A2218',
    air_quality: '#1A2A22',
    utility_outage: '#221A2E',
    event: '#2A1A24',
  },
} as const;

// ── Composite type ─────────────────────────────────────────────────
export type ThemeColors = typeof lightColors & typeof sharedColors & typeof tierColors;

// ── Spacing ────────────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// ── Typography ─────────────────────────────────────────────────────
export const typography = {
  fontFamily: {
    heading: 'Cal Sans, system-ui, sans-serif',
    body: 'Geist, system-ui, sans-serif',
    mono: 'Geist Mono, monospace',
  },
} as const;

// ── Border radius ──────────────────────────────────────────────────
export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// ── Shadows (CSS box-shadow strings) ───────────────────────────────
export const shadows = {
  light: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  heavy: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
} as const;
