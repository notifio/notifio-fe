import type maplibregl from 'maplibre-gl';

export const TILE_LIGHT = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
export const TILE_DARK = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
export const DEFAULT_MAP_CENTER = { lat: 48.67, lng: 19.70 };
export const DEFAULT_MAP_ZOOM = 7;

// ── Source IDs ──────────────────────────────────────────────────────
export const PIN_SOURCE_ID = 'pins';
export const FLOW_SOURCE_ID = 'traffic-flow';

// ── Clustering ──────────────────────────────────────────────────────
export const CLUSTER_MAX_ZOOM = 14;
export const CLUSTER_RADIUS = 80;

// ── Traffic flow layer ──────────────────────────────────────────────
export const TRAFFIC_FLOW_LAYER: maplibregl.LayerSpecification = {
  id: 'traffic-flow-line',
  type: 'line',
  source: FLOW_SOURCE_ID,
  paint: {
    'line-color': [
      'match',
      ['get', 'congestion'],
      'moderate', '#EAB308',
      'heavy', '#FF7A2F',
      'severe', '#FF3B30',
      '#EAB308',
    ],
    'line-width': [
      'match',
      ['get', 'congestion'],
      'moderate', 3,
      'heavy', 4,
      'severe', 5,
      3,
    ],
    'line-opacity': 0.75,
  },
  layout: {
    'line-cap': 'round',
    'line-join': 'round',
  },
};

// ── Pin data layer (invisible — only for clustering source) ─────────
export const PIN_DATA_LAYER: maplibregl.LayerSpecification = {
  id: 'pin-data',
  type: 'circle',
  source: PIN_SOURCE_ID,
  paint: {
    'circle-radius': 0,
    'circle-opacity': 0,
  },
};

// ── Source configs (functions — need runtime GeoJSON data) ──────────

export function createFlowSource(
  data: GeoJSON.FeatureCollection,
): maplibregl.SourceSpecification {
  return { type: 'geojson', data };
}

export function createPinSource(
  data: GeoJSON.FeatureCollection,
): maplibregl.SourceSpecification {
  return {
    type: 'geojson',
    data,
    cluster: true,
    clusterMaxZoom: CLUSTER_MAX_ZOOM,
    clusterRadius: CLUSTER_RADIUS,
  };
}
