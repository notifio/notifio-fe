// Mobile mirror of web's apps/web/src/components/app/alert-card-utils.ts
// resolveSourceDisplay helper. Pure function, no platform-specific code —
// candidate for future extraction to @notifio/shared. Until that
// refactor lands, mobile carries its own copy to avoid pulling
// `@notifio/shared` via the root barrel (which transitively imports
// h3-js and crashes Hermes on the `TextDecoder("utf-16le")` call).
//
// Subpath import below (`@notifio/shared/constants`) is the standing
// rule for every mobile file consuming a shared export.

import { getSourceAdapterInfo } from '@notifio/shared/constants';

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
 * `t` is expected to be scoped to the `alerts` namespace (e.g.
 * `useTranslation()` returning the root `t`, called as `t('sourceCommunity')`
 * — or pass a pre-bound `t('alerts.<key>')` helper).
 */
export function resolveSourceDisplay(
  sourceCode: string | null | undefined,
  t: (key: string) => string,
): { abbr: string; full: string } | null {
  if (!sourceCode) return null;
  if (sourceCode === 'user_report') {
    const community = t('alerts.sourceCommunity');
    return { abbr: community, full: community };
  }
  const info = getSourceAdapterInfo(sourceCode);
  if (!info) {
    const unknown = t('alerts.sourceUnknown');
    return { abbr: unknown, full: unknown };
  }
  return { abbr: info.abbr, full: info.name };
}
