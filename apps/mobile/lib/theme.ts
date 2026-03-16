// TODO: Import colors, spacing, borderRadius from @notifio/ui when wired up

export const theme = {
  colors: {
    primary: '#2563EB',
    primaryDark: '#1D4ED8',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    border: '#F3F4F6',
    text: '#111827',
    textSecondary: '#4B5563',
    textMuted: '#9CA3AF',
    textInverse: '#FFFFFF',
    danger: '#EF4444',
    severity: {
      info: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
      warning: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
      critical: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
    },
    alertType: {
      weather: { icon: '#0EA5E9', bg: '#F0F9FF' },
      traffic: { icon: '#F97316', bg: '#FFF7ED' },
      air_quality: { icon: '#10B981', bg: '#ECFDF5' },
      utility_outage: { icon: '#8B5CF6', bg: '#F5F3FF' },
      event: { icon: '#EC4899', bg: '#FDF2F8' },
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
