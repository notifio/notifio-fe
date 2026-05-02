// TODO: Move MapPin types to @notifio/shared when stable
import type { EventFeedItem, TeaserPin, TrafficIncident } from '@notifio/shared/types';

export type MapPinSource =
  | 'electricity'
  | 'water'
  | 'gas'
  | 'heat'
  | 'traffic'
  | 'air_quality'
  | 'pollen'
  | 'hydrology'
  | 'wildfire'
  | 'outage_internet'
  | 'weather_alerts'
  | 'weather_forecast'
  | 'event';

// Step 7: extended from the 4-utility port to web parity. The newer
// environmental categories (air_quality, pollen, hydrology, wildfire,
// outage_internet) get their own pin sources; weather_warning is
// branched on `event.source.code` via `resolveEventSource` below.
const EVENT_CATEGORY_TO_SOURCE: Record<string, MapPinSource> = {
  outage_electric: 'electricity',
  outage_water: 'water',
  outage_gas: 'gas',
  outage_heat: 'heat',
  air_quality: 'air_quality',
  pollen: 'pollen',
  hydrology: 'hydrology',
  wildfire: 'wildfire',
  outage_internet: 'outage_internet',
};

// `weather_warning` events come from two distinct upstream sources.
// Branch on `event.source.code` so MeteoAlarm renders amber and
// Weather Intelligence renders deeper amber.
function resolveEventSource(event: EventFeedItem): MapPinSource | undefined {
  if (event.category === 'weather_warning') {
    return event.source?.code === 'malarm_warning' ? 'weather_alerts' : 'weather_forecast';
  }
  return EVENT_CATEGORY_TO_SOURCE[event.category];
}
// EVENT-1: align with web's vocabulary (`active | upcoming | resolved`).
// `scheduled` was a legacy synonym for `upcoming`; the web fix in PR #58
// already renamed it but mobile carried the old name and used it
// inconsistently (e.g. `event.isResolved ? 'scheduled' : 'active'` —
// resolved was being reported as scheduled). Resolved pins are filtered
// out before the map renders, so the type only needs the two visible
// states.
export type MapPinStatus = 'active' | 'upcoming';

export interface MapPin {
  id: string;
  source: MapPinSource;
  status: MapPinStatus;
  lat: number;
  lng: number;
  title: string;
  description: string;
  locality?: string;
  /** ISO timestamp the pin's footer label is computed from. For active
   *  events this is `startedAt` (so "X min ago"); for upcoming events
   *  this is `eventFrom` (so "in X days") — never `createdAt`, which
   *  was the source of the "Just now" label on Veolia future-dated
   *  events (EVENT-1). */
  timestamp: string;
  incidentType?: string;
  /** Teaser pins are off-tier previews — render greyed and never open
   *  the callout; tapping opens the upsell sheet instead. Step 8. */
  isTeaser?: boolean;
}

// Step 8: BE → FE source code shim. Mirrors web's normalize-pins so a
// teaser emitted with `weather` becomes the alerts pin and unknown
// codes (earthquake, community) collapse to the generic event pin
// rather than crashing the union.
const BE_TO_FE_SOURCE: Record<string, MapPinSource> = {
  weather: 'weather_alerts',
  electricity: 'electricity',
  water: 'water',
  gas: 'gas',
  heat: 'heat',
  traffic: 'traffic',
  air_quality: 'air_quality',
  pollen: 'pollen',
  hydrology: 'hydrology',
  wildfire: 'wildfire',
  outage_internet: 'outage_internet',
  earthquake: 'event',
  community: 'event',
};

function teaserSourceToFE(beSource: string): MapPinSource {
  return BE_TO_FE_SOURCE[beSource] ?? 'event';
}

function teaserPinToMapPin(t: TeaserPin): MapPin {
  return {
    id: `teaser:${t.source}:${t.lat}:${t.lng}`,
    source: teaserSourceToFE(t.source),
    status: 'active',
    lat: t.lat,
    lng: t.lng,
    title: '',
    description: '',
    timestamp: new Date().toISOString(),
    isTeaser: true,
  };
}

function isFutureIso(value: string | null | undefined): boolean {
  if (!value) return false;
  const t = new Date(value).getTime();
  return Number.isFinite(t) && t > Date.now();
}

function trafficToPin(incident: TrafficIncident): MapPin {
  return {
    id: incident.id,
    source: 'traffic',
    status: 'active',
    lat: incident.location.lat,
    lng: incident.location.lng,
    title: incident.description,
    description: `${incident.type} — ${incident.severity}`,
    incidentType: incident.type,
    timestamp: new Date().toISOString(),
  };
}

function eventToPin(event: EventFeedItem): MapPin | null {
  // Resolved events are dropped at the call site already, but keep this
  // null-safe so a stray resolved row doesn't render mis-statused.
  if (event.status === 'resolved') return null;
  if (event.lat == null || event.lng == null) return null;
  const isFuture = isFutureIso(event.eventFrom);
  return {
    id: event.eventId,
    source: resolveEventSource(event) ?? 'event',
    status: isFuture ? 'upcoming' : 'active',
    lat: event.lat,
    lng: event.lng,
    title: event.title ?? '',
    description: event.subcategoryName ?? '',
    // For future events show the start time, not the creation time —
    // the user's report was "11.5.2026 event labeled Just now" because
    // we used `createdAt` (today) instead of `eventFrom` (11 days
    // away).
    timestamp: (isFuture && event.eventFrom) ? event.eventFrom : event.createdAt,
  };
}

export function normalizeMapPins(
  trafficIncidents: TrafficIncident[],
  events: EventFeedItem[],
  teasers?: TeaserPin[],
): MapPin[] {
  const pins: MapPin[] = [];

  for (const t of trafficIncidents) {
    pins.push(trafficToPin(t));
  }
  for (const e of events) {
    const pin = eventToPin(e);
    if (pin) pins.push(pin);
  }
  if (teasers) {
    for (const t of teasers) {
      pins.push(teaserPinToMapPin(t));
    }
  }

  return pins;
}
