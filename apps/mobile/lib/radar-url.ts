import type { RadarConfig } from '@notifio/api-client';

/**
 * Build a tile URL from the BE template. react-native-maps' UrlTile
 * is URL-only — no header injection — so the api-key rides as a
 * query param via BE PR #543's apiKeyGuard fallback.
 */
export function buildRadarTileUrl(
  config: RadarConfig,
  layer: string,
  tm: number,
  apiKey?: string,
): string {
  const base = config.tileUrlTemplate
    .replace('{layer}', layer)
    .replace('{tm}', String(tm));
  if (!apiKey) return base;
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}apiKey=${apiKey}`;
}
