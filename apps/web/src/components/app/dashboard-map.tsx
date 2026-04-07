'use client';

import { IconLoader2, IconRefresh } from '@tabler/icons-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

import { MAP_PIN_STYLES } from '@/lib/map-pin-config';
import type { MapPin, MapPinSource } from '@/lib/normalize-pins';

import { MapPinPopup } from './map-pin-popup';

const DEFAULT_ZOOM = 13;
const FALLBACK_ZOOM = 7;
const TILE_LIGHT = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const TILE_DARK = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const SOURCE_ID = 'pins';
const SCHEDULED_OPACITY = 0.5;

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
          source: p.source,
          status: p.status,
          title: p.title,
          description: p.description,
          locality: p.locality ?? '',
          timestamp: p.timestamp,
          color: MAP_PIN_STYLES[p.source].color,
          opacity: p.status === 'scheduled' ? SCHEDULED_OPACITY : 1,
        },
      })),
  };
}

interface DashboardMapProps {
  pins?: MapPin[];
  activeFilters?: Set<MapPinSource>;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  center?: { lat: number; lng: number };
  isGpsCenter?: boolean;
}

export function DashboardMap({
  pins = [],
  activeFilters = new Set(),
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
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const sourceReady = useRef(false);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);

  const closePopup = useCallback(() => {
    popupRef.current?.remove();
    popupRef.current = null;
  }, []);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const mapCenter = center ?? { lat: 48.67, lng: 19.70 };
    const zoom = center && isGpsCenter ? DEFAULT_ZOOM : (center ? DEFAULT_ZOOM : FALLBACK_ZOOM);

    const tileStyle = resolvedTheme === 'dark' ? TILE_DARK : TILE_LIGHT;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: tileStyle,
      center: [mapCenter.lng, mapCenter.lat],
      zoom,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
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

      // Individual pin circles
      map.addLayer({
        id: 'unclustered-pin',
        type: 'circle',
        source: SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': 7,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF',
          'circle-opacity': ['get', 'opacity'],
        },
      });

      sourceReady.current = true;
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

    // Click pin → show popup
    map.on('click', 'unclustered-pin', (e) => {
      const feature = map.queryRenderedFeatures(e.point, { layers: ['unclustered-pin'] })[0];
      if (!feature?.properties) return;
      const props = feature.properties;
      const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number];

      const pin: MapPin = {
        id: props.id as string,
        source: props.source as MapPinSource,
        status: props.status as MapPin['status'],
        lat: coords[1],
        lng: coords[0],
        title: props.title as string,
        description: props.description as string,
        locality: (props.locality as string) || undefined,
        timestamp: props.timestamp as string,
      };

      closePopup();

      const el = document.createElement('div');
      const root = createRoot(el);
      const popup = new maplibregl.Popup({ closeButton: false, offset: 12, maxWidth: 'none' })
        .setLngLat([pin.lng, pin.lat])
        .setDOMContent(el)
        .addTo(map);

      root.render(
        <MapPinPopup
          pin={pin}
          onClose={() => {
            popup.remove();
            popupRef.current = null;
          }}
        />,
      );

      popupRef.current = popup;
    });

    // Cursors
    map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
    map.on('mouseenter', 'unclustered-pin', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'unclustered-pin', () => { map.getCanvas().style.cursor = ''; });

    mapRef.current = map;

    return () => {
      sourceReady.current = false;
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update source data when pins or filters change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !sourceReady.current) return;

    const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData(pinsToGeoJSON(pins, activeFilters));
    }
  }, [pins, activeFilters]);

  // User location marker — runs when GPS resolves
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !center || !isGpsCenter) return;

    // Remove old marker if any
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

    // Fly to user location
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
      const center = map.getCenter();
      const zoom = map.getZoom();
      map.setStyle(newStyle);
      map.once('style.load', () => {
        map.setCenter(center);
        map.setZoom(zoom);
        // Re-add pin source and layers
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
          map.addLayer({
            id: 'unclustered-pin',
            type: 'circle',
            source: SOURCE_ID,
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': ['get', 'color'],
              'circle-radius': 7,
              'circle-stroke-width': 2,
              'circle-stroke-color': resolvedTheme === 'dark' ? '#1F3A5F' : '#FFFFFF',
              'circle-opacity': ['get', 'opacity'],
            },
          });
          sourceReady.current = true;
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-border">
      <div ref={containerRef} className="h-full w-full bg-card" />

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
