// TODO: Move MapPin types to @notifio/shared when stable
import type { EventFeedItem } from '@notifio/api-client';
import type { TrafficIncident } from '@notifio/shared';

// FE-P1.2: dropped the grey "event" fallback for five categories that
// already have their own pin colours + icons. Order matches the legend.
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
  | 'weather_forecast';
/**
 * Lifecycle label rendered on a pin. Matches the API's `EventLifecycleStatus`
 * (`upcoming | active | resolved`) — this enum is FE-local until the BE
 * status field rolls out across `OutageRecord` adapters too. `resolved`
 * pins are filtered out before reaching the map; the type still includes
 * the variant so callers can reason about it.
 */
export type MapPinStatus = 'active' | 'upcoming' | 'resolved';
export type TrafficIncidentType =
  | 'accident'
  | 'congestion'
  | 'construction'
  | 'event'
  | 'flooding'
  | 'road_closure'
  | 'other';

export interface MapPin {
  id: string;
  source: MapPinSource;
  status: MapPinStatus;
  lat: number;
  lng: number;
  title: string;
  description: string;
  locality?: string;
  timestamp: string;
  incidentType?: TrafficIncidentType;
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
    timestamp: new Date().toISOString(),
    incidentType: incident.type as TrafficIncidentType,
  };
}

// ── Event → MapPin mapping ───────────────────────────────────────────

// Subcategory codes that map to specific traffic incident types
const EVENT_SUBCATEGORY_TO_INCIDENT: Record<string, TrafficIncidentType> = {
  traffic_accident: 'accident',
  traffic_jam: 'congestion',
  road_closure: 'road_closure',
  road_works: 'construction',
  road_closure_planned: 'road_closure',
  transport_disruption: 'congestion',
  flooding: 'flooding',
};

// Category codes that map to outage pin sources. Five categories were
// previously falling through to the generic grey "event" pin
// (FE-P1.2) — air_quality / pollen / hydrology / wildfire /
// outage_internet — even though the BE emits them with stable
// category codes. Map them all explicitly.
const EVENT_CATEGORY_TO_SOURCE: Record<string, MapPinSource> = {
  outage_electric: 'electricity',
  outage_water: 'water',
  outage_heat: 'heat',
  outage_gas: 'gas',
  outage_internet: 'outage_internet',
  air_quality: 'air_quality',
  pollen: 'pollen',
  hydrology: 'hydrology',
  wildfire: 'wildfire',
};

// Categories that should not appear as map pins
const SKIP_CATEGORIES = new Set(['name_day']);

// Step 7: `weather_warning` events come from two distinct upstream
// sources. Branch on `event.source.code` so MeteoAlarm warnings
// (`malarm_warning`) render as the amber `weather_alerts` pin while
// Weather Intelligence forecasts (`weather_intelligence`, default)
// render as the deeper-amber `weather_forecast` pin.
function resolveEventSource(event: EventFeedItem): MapPinSource | undefined {
  if (event.category === 'weather_warning') {
    return event.source?.code === 'malarm_warning' ? 'weather_alerts' : 'weather_forecast';
  }
  return EVENT_CATEGORY_TO_SOURCE[event.category];
}

function eventStatus(event: EventFeedItem): MapPinStatus {
  if (event.eventFrom) {
    const fromMs = new Date(event.eventFrom).getTime();
    if (Number.isFinite(fromMs) && fromMs > Date.now()) {
      return 'upcoming';
    }
  }
  return 'active';
}

function eventToPin(event: EventFeedItem): MapPin | null {
  if (event.lat == null || event.lng == null) return null;

  const categoryCode = event.category;
  const subcategoryCode = event.subcategory ?? '';
  const title = event.title ?? '';
  const description = event.subcategoryName ?? '';

  if (SKIP_CATEGORIES.has(categoryCode)) return null;

  const status = eventStatus(event);

  // Outage-type events → utility source pins
  const outageSource = resolveEventSource(event);
  if (outageSource) {
    return {
      id: event.eventId,
      source: outageSource,
      status,
      lat: event.lat,
      lng: event.lng,
      title,
      description,
      timestamp: event.createdAt,
    };
  }

  // Subcategory → specific incident type
  const incidentType = EVENT_SUBCATEGORY_TO_INCIDENT[subcategoryCode];
  if (incidentType) {
    return {
      id: event.eventId,
      source: 'traffic',
      status,
      lat: event.lat,
      lng: event.lng,
      title,
      description,
      timestamp: event.createdAt,
      incidentType,
    };
  }

  // Category-level fallback
  const fallbackType: TrafficIncidentType = 'event';

  return {
    id: event.eventId,
    source: 'traffic',
    status,
    lat: event.lat,
    lng: event.lng,
    title,
    description,
    timestamp: event.createdAt,
    incidentType: fallbackType,
  };
}

export function normalizeMapPins(
  trafficIncidents: TrafficIncident[],
  events?: EventFeedItem[],
): MapPin[] {
  const pins: MapPin[] = [];

  for (const t of trafficIncidents) {
    pins.push(trafficToPin(t));
  }
  if (events) {
    for (const e of events) {
      if (e.status !== 'resolved') {
        const pin = eventToPin(e);
        if (pin) pins.push(pin);
      }
    }
  }

  return pins;
}
