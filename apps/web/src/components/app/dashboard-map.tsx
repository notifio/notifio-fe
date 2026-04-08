'use client';

import { IconLoader2, IconRefresh } from '@tabler/icons-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';

import type { TrafficFlowResponse } from '@notifio/api-client';

import type { MapPin, MapPinSource } from '@/lib/normalize-pins';

import { MapMarker } from './map-marker';

const DEFAULT_ZOOM = 13;
const FALLBACK_ZOOM = 7;
const TILE_LIGHT = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const TILE_DARK = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const SOURCE_ID = 'pins';
const FLOW_SOURCE_ID = 'traffic-flow';

function flowToGeoJSON(
  flow: TrafficFlowResponse | null,
): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  if (!flow) return { type: 'FeatureCollection', features: [] };
  return {
    type: 'FeatureCollection',
    features: flow.segments
      .filter((seg) => seg.congestion !== 'free')
      .map((seg, i) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: seg.coordinates,
        },
        properties: {
          id: i,
          congestion: seg.congestion,
          currentSpeed: seg.currentSpeed,
          freeFlowSpeed: seg.freeFlowSpeed,
        },
      })),
  };
}

function pinsToGeoJSON(
  pins: MapPin[],
  activeFilters: Set<MapPinSource>,
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: pins
      .filter((p) => activeFilters.has(p.source))
      .map((p) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] },
        properties: {
          id: p.id,
        },
      })),
  };
}

interface DashboardMapProps {
  pins?: MapPin[];
  activeFilters?: Set<MapPinSource>;
  flowSegments?: TrafficFlowResponse | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  center?: { lat: number; lng: number };
  isGpsCenter?: boolean;
}

export function DashboardMap({
  pins = [],
  activeFilters = new Set(),
  flowSegments = null,
  isLoading = false,
  error = null,
  onRetry,
  center,
  isGpsCenter = false,
}: DashboardMapProps) {
  const t = useTranslations('map');
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const sourceReady = useRef(false);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  // NOTE: For >200 pins, consider falling back to GeoJSON circle layer approach
  const markersRef = useRef<Map<string, { marker: maplibregl.Marker; root: Root }>>(new Map());
  const [expandedPinId, setExpandedPinId] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Inject expand animation once
    if (!document.getElementById('pin-expand-style')) {
      const style = document.createElement('style');
      style.id = 'pin-expand-style';
      style.textContent = `
        @keyframes pin-expand {
          from { opacity: 0.8; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `;
      document.head.appendChild(style);
    }

    const mapCenter = center ?? { lat: 48.67, lng: 19.70 };
    const zoom = center && isGpsCenter ? DEFAULT_ZOOM : center ? DEFAULT_ZOOM : FALLBACK_ZOOM;

    const tileStyle = resolvedTheme === 'dark' ? TILE_DARK : TILE_LIGHT;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: tileStyle,
      center: [mapCenter.lng, mapCenter.lat],
      zoom,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      // Traffic flow roads (rendered underneath pins)
      map.addSource(FLOW_SOURCE_ID, {
        type: 'geojson',
        data: flowToGeoJSON(flowSegments),
      });
      map.addLayer({
        id: 'traffic-flow-line',
        type: 'line',
        source: FLOW_SOURCE_ID,
        paint: {
          'line-color': [
            'match', ['get', 'congestion'],
            'moderate', '#EAB308',
            'heavy', '#FF7A2F',
            'severe', '#FF3B30',
            '#EAB308',
          ],
          'line-width': [
            'match', ['get', 'congestion'],
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
      });

      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: pinsToGeoJSON(pins, activeFilters),
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Cluster circles
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#94A3B8',
          'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 50, 32],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF',
        },
      });

      // Cluster count labels
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-size': 12,
        },
        paint: {
          'text-color': '#FFFFFF',
        },
      });

      sourceReady.current = true;

      if (resolvedTheme === 'dark' && map.getLayer('water')) {
        map.setPaintProperty('water', 'fill-color', '#0E223F');
      }
    });

    // Click cluster → zoom in
    map.on('click', 'clusters', (e) => {
      const feature = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })[0];
      if (!feature) return;
      const clusterId = feature.properties?.cluster_id as number;
      const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;
      source.getClusterExpansionZoom(clusterId).then((zoom) => {
        const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number];
        map.easeTo({ center: coords, zoom });
      });
    });

    // Click map elsewhere → collapse expanded pin
    map.on('click', (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      if (features.length === 0) {
        setExpandedPinId(null);
      }
    });

    // Cursors for clusters
    map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });

    mapRef.current = map;

    const markers = markersRef.current;
    return () => {
      sourceReady.current = false;
      for (const entry of markers.values()) {
        entry.marker.remove();
      }
      markers.clear();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync HTML markers with pins + filters + expanded state
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !sourceReady.current) return;

    const visiblePins = pins.filter((p) => activeFilters.has(p.source));
    const visibleIds = new Set(visiblePins.map((p) => p.id));

    // Remove markers for pins no longer visible
    for (const [id, entry] of markersRef.current) {
      if (!visibleIds.has(id)) {
        entry.marker.remove();
        markersRef.current.delete(id);
      }
    }

    const themeMode = resolvedTheme === 'dark' ? 'dark' : 'light';
    const labels = { scheduled: t('scheduled'), active: t('active') };

    for (const pin of visiblePins) {
      const existing = markersRef.current.get(pin.id);
      if (existing) {
        // Re-render with updated expanded state
        existing.root.render(
          <MapMarker
            pin={pin}
            isExpanded={expandedPinId === pin.id}
            theme={themeMode}
            labels={labels}
            onToggle={() => setExpandedPinId((prev) => (prev === pin.id ? null : pin.id))}
            onClose={() => setExpandedPinId(null)}
          />,
        );
      } else {
        const el = document.createElement('div');
        const root = createRoot(el);
        root.render(
          <MapMarker
            pin={pin}
            isExpanded={false}
            theme={themeMode}
            labels={labels}
            onToggle={() => setExpandedPinId((prev) => (prev === pin.id ? null : pin.id))}
            onClose={() => setExpandedPinId(null)}
          />,
        );
        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([pin.lng, pin.lat])
          .addTo(map);
        markersRef.current.set(pin.id, { marker, root });
      }
    }
  }, [pins, activeFilters, expandedPinId, resolvedTheme, t]);

  // Update GeoJSON source data for cluster layer when pins or filters change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !sourceReady.current) return;

    const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData(pinsToGeoJSON(pins, activeFilters));
    }
  }, [pins, activeFilters]);

  // Update traffic flow data
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !sourceReady.current) return;
    const source = map.getSource(FLOW_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData(flowToGeoJSON(flowSegments));
    }
  }, [flowSegments]);

  // User location marker — runs when GPS resolves
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !center || !isGpsCenter) return;

    userMarkerRef.current?.remove();

    const dot = document.createElement('div');
    dot.style.width = '16px';
    dot.style.height = '16px';
    dot.style.borderRadius = '50%';
    dot.style.backgroundColor = '#3B82F6';
    dot.style.border = '3px solid white';
    dot.style.boxShadow = '0 0 0 6px rgba(59, 130, 246, 0.3)';

    userMarkerRef.current = new maplibregl.Marker({ element: dot })
      .setLngLat([center.lng, center.lat])
      .addTo(map);

    map.flyTo({ center: [center.lng, center.lat], zoom: DEFAULT_ZOOM });

    return () => {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
    };
  }, [center, isGpsCenter]);

  // Switch map tile style when theme changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const newStyle = resolvedTheme === 'dark' ? TILE_DARK : TILE_LIGHT;
    const currentStyle = map.getStyle()?.sprite;
    const isDark = typeof currentStyle === 'string' && currentStyle.includes('dark-matter');
    const wantDark = resolvedTheme === 'dark';
    if (isDark !== wantDark) {
      const savedCenter = map.getCenter();
      const savedZoom = map.getZoom();
      map.setStyle(newStyle);
      map.once('style.load', () => {
        map.setCenter(savedCenter);
        map.setZoom(savedZoom);
        // Re-add traffic flow layer
        if (!map.getSource(FLOW_SOURCE_ID)) {
          map.addSource(FLOW_SOURCE_ID, {
            type: 'geojson',
            data: flowToGeoJSON(flowSegments),
          });
          map.addLayer({
            id: 'traffic-flow-line',
            type: 'line',
            source: FLOW_SOURCE_ID,
            paint: {
              'line-color': [
                'match', ['get', 'congestion'],
                'moderate', '#EAB308',
                'heavy', '#FF7A2F',
                'severe', '#FF3B30',
                '#EAB308',
              ],
              'line-width': [
                'match', ['get', 'congestion'],
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
          });
        }
        // Re-add pin source and cluster layers
        if (!map.getSource(SOURCE_ID)) {
          map.addSource(SOURCE_ID, {
            type: 'geojson',
            data: pinsToGeoJSON(pins, activeFilters),
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50,
          });
          map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: SOURCE_ID,
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': '#94A3B8',
              'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 50, 32],
              'circle-stroke-width': 2,
              'circle-stroke-color': resolvedTheme === 'dark' ? '#1F3A5F' : '#FFFFFF',
            },
          });
          map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: SOURCE_ID,
            filter: ['has', 'point_count'],
            layout: { 'text-field': '{point_count_abbreviated}', 'text-size': 12 },
            paint: { 'text-color': '#FFFFFF' },
          });
          // NOTE: unclustered-pin layer is intentionally omitted — individual pins
          // are rendered as HTML markers via the markersRef sync useEffect above.
          sourceReady.current = true;
        }
        if (resolvedTheme === 'dark' && map.getLayer('water')) {
          map.setPaintProperty('water', 'fill-color', '#0E223F');
        }
        // HTML markers re-render automatically when resolvedTheme changes via the
        // marker sync useEffect — no manual re-add needed here.
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-border">
      <div ref={containerRef} className="h-full w-full bg-background" />

      {isLoading && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center pt-14">
          <div className="flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 shadow-sm backdrop-blur-sm">
            <IconLoader2 size={14} className="animate-spin text-muted" />
            <span className="text-xs text-muted">{t('loadingMapData')}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-x-0 top-0 z-20 flex justify-center pt-14">
          <div className="flex items-center gap-2 rounded-full bg-danger/10 px-4 py-2 shadow-sm">
            <span className="text-xs font-medium text-danger">{error}</span>
            {onRetry && (
              <button
                onClick={onRetry}
                className="rounded-full p-1 text-danger hover:bg-danger/20"
              >
                <IconRefresh size={12} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
