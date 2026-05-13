import type { NotificationHistoryItem } from '@notifio/api-client';
import { getSourceAdapterInfo } from '@notifio/shared';

export function isResolved(n: NotificationHistoryItem): boolean {
  if (n.status !== 'sent') return true;
  const nt = (n as Record<string, unknown>).notificationType;
  if (typeof nt === 'string') return nt === 'all_clear';
  if (n.title.startsWith('Ukončené:') || n.title.startsWith('Resolved:')) return true;
  return false;
}

export const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  critical: { bg: 'rgba(255,59,48,0.15)', text: '#FF3B30' },
  warning: { bg: 'rgba(255,122,47,0.15)', text: '#FF7A2F' },
  info: { bg: 'rgba(58,134,255,0.15)', text: '#3A86FF' },
};

export const ACCENT_COLORS: Record<string, string> = {
  critical: '#FF3B30',
  warning: '#FF7A2F',
  info: '#3A86FF',
};

export { hexToRgba } from '@/lib/color';

/**
 * Resolve a `cod_source_adapter` value to display strings for alert
 * surfaces. Returns null when no source is provided so callers can
 * skip the row/segment entirely.
 *
 * Branches:
 * - `user_report` → community-report i18n string (no abbrev)
 * - known adapter code → `SOURCE_ADAPTERS` entry from shared
 * - unknown / unmapped code → `sourceUnknown` i18n fallback
 *
 * `t` is expected to be `useTranslations('alerts')`.
 */
export function resolveSourceDisplay(
  sourceCode: string | null | undefined,
  t: (key: string) => string,
): { abbr: string; full: string } | null {
  if (!sourceCode) return null;
  if (sourceCode === 'user_report') {
    const community = t('sourceCommunity');
    return { abbr: community, full: community };
  }
  const info = getSourceAdapterInfo(sourceCode);
  if (!info) {
    const unknown = t('sourceUnknown');
    return { abbr: unknown, full: unknown };
  }
  return { abbr: info.abbr, full: info.name };
}
