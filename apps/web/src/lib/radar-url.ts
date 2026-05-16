import type { RadarConfig } from '@notifio/api-client';

/**
 * Build a MapLibre-compatible tile URL from the BE-provided template.
 * `{z}/{x}/{y}` placeholders are left intact for MapLibre to fill; the
 * other placeholders are substituted at hook time.
 *
 * The api-key is appended as `?apiKey=` (or `&apiKey=` if the template
 * already has a query string). MapLibre fetches tiles via internal
 * <img> elements which can't send custom headers — query param is the
 * only way to authenticate. BE PR #543 added the apiKeyGuard query
 * fallback to accept it.
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
