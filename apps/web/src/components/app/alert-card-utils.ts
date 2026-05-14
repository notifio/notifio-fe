import { getSourceAdapterInfo } from '@notifio/shared';

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
