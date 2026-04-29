'use client';

import { IconLoader2, IconRefresh, IconX } from '@tabler/icons-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import type { Root } from 'react-dom/client';

import type { TrafficFlowResponse } from '@notifio/api-client';

import type { ClusterMarkerEntry, MarkerEntry } from '@/lib/map/sync-markers';
import { syncMarkers as syncMarkersImpl } from '@/lib/map/sync-markers';
import {
  FLOW_SOURCE_ID,
  PIN_DATA_LAYER,
  PIN_SOURCE_ID,
  TILE_DARK,
  TILE_LIGHT,
  TRAFFIC_FLOW_LAYER,
  createFlowSource,
  createPinSource,
} from '@/lib/map-config';
import type { MapPin, MapPinSource, TrafficIncidentType } from '@/lib/normalize-pins';

import { MapMarker } from './map-marker';

const DEFAULT_ZOOM = 13;
const FALLBACK_ZOOM = 7;

function flowToGeoJSON(
  flow: TrafficFlowResponse | null
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
  activeTrafficTypes: Set<TrafficIncidentType>
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: pins
      .filter((p) => {
        if (!activeFilters.has(p.source)) return false;
        if (p.source === 'traffic') {
          return p.incidentType ? activeTrafficTypes.has(p.incidentType) : false;
        }
        return true;
      })
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
  activeTrafficTypes?: Set<TrafficIncidentType>;
  flowSegments?: TrafficFlowResponse | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  center?: { lat: number; lng: number };
  isGpsCenter?: boolean;
  onCenterChange?: (center: { lat: number; lng: number }) => void;
  flyTo?: { lat: number; lng: number; zoom: number } | null;
  onFlyToComplete?: () => void;
  infoOverlay?: { title: string; category: string; description: string } | null;
  onCloseOverlay?: () => void;
}

export function DashboardMap({
  pins = [],
  activeFilters = new Set(),
  activeTrafficTypes = new Set(),
  flowSegments = null,
  isLoading = false,
  error = null,
  onRetry,
  center,
  isGpsCenter = false,
  onCenterChange,
  flyTo,
  onFlyToComplete,
  infoOverlay,
  onCloseOverlay,
}: DashboardMapProps) {
  const t = useTranslations('map');
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const sourceReady = useRef(false);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const markersRef = useRef<Map<string, MarkerEntry>>(new Map());
  const clusterMarkersRef = useRef<Map<number, ClusterMarkerEntry>>(new Map());
  const [expandedPinId, setExpandedPinId] = useState<string | null>(null);

  // Keep refs in sync so event-driven callbacks see current values
  const pinsRef = useRef(pins);
  pinsRef.current = pins;
  const filtersRef = useRef(activeFilters);
  filtersRef.current = activeFilters;
  const trafficTypesRef = useRef(activeTrafficTypes);
  trafficTypesRef.current = activeTrafficTypes;
  const themeRef = useRef(resolvedTheme);
  themeRef.current = resolvedTheme;
  const expandedPinIdRef = useRef(expandedPinId);
  expandedPinIdRef.current = expandedPinId;
  const tRef = useRef(t);
  tRef.current = t;
  const onCenterChangeRef = useRef(onCenterChange);
  onCenterChangeRef.current = onCenterChange;
  const onCloseOverlayRef = useRef(onCloseOverlay);
  onCloseOverlayRef.current = onCloseOverlay;
  const debouncedCenterChange = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ── Marker sync ──────────────────────────────────────────────────────
  const renderMarker = (
    root: Root,
    pin: MapPin,
    opts: { isExpanded: boolean; theme: 'light' | 'dark'; labels: { upcoming: string; active: string }; clusterCount?: number; onToggle: () => void; onClose: () => void },
  ) => {
    root.render(
      <MapMarker
        pin={pin}
        isExpanded={opts.isExpanded}
        theme={opts.theme}
        labels={opts.labels}
        clusterCount={opts.clusterCount}
        onToggle={opts.onToggle}
        onClose={opts.onClose}
      />,
    );
  };

  const doSyncMarkers = useRef((map: maplibregl.Map) => {
    if (!sourceReady.current) return;
    const translate = tRef.current;
    syncMarkersImpl({
      map,
      Marker: maplibregl.Marker,
      pins: pinsRef.current,
      theme: (themeRef.current === 'dark' ? 'dark' : 'light') as 'light' | 'dark',
      expandedPinId: expandedPinIdRef.current,
      labels: { upcoming: translate('upcoming'), active: translate('active') },
      markers: markersRef.current,
      clusterMarkers: clusterMarkersRef.current,
      renderMarker,
      onTogglePin: (pinId) => setExpandedPinId((prev) => (prev === pinId ? null : pinId)),
      onClosePin: () => setExpandedPinId(null),
      onSyncAgain: () => doSyncMarkers.current(map),
    });
  });

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

    const mapCenter = center ?? { lat: 48.67, lng: 19.7 };
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
      map.addSource(FLOW_SOURCE_ID, createFlowSource(flowToGeoJSON(flowSegments)));
      map.addLayer(TRAFFIC_FLOW_LAYER);

      map.addSource(PIN_SOURCE_ID, createPinSource(pinsToGeoJSON(pins, activeFilters, activeTrafficTypes)));
      map.addLayer(PIN_DATA_LAYER);

      sourceReady.current = true;

      if (resolvedTheme === 'dark' && map.getLayer('water')) {
        map.setPaintProperty('water', 'fill-color', '#0E223F');
      }

      // Initial sync after source is ready
      doSyncMarkers.current(map);
    });

    // Re-sync when viewport changes or source data updates
    map.on('moveend', () => {
      doSyncMarkers.current(map);
      // Debounced center change callback for dynamic data loading
      clearTimeout(debouncedCenterChange.current);
      debouncedCenterChange.current = setTimeout(() => {
        const c = map.getCenter();
        onCenterChangeRef.current?.({ lat: c.lat, lng: c.lng });
      }, 1500);
    });
    map.on('sourcedata', (e) => {
      if (e.sourceId === PIN_SOURCE_ID && sourceReady.current) {
        doSyncMarkers.current(map);
      }
    });

    // Click map → collapse expanded pin + close info overlay
    map.on('click', () => {
      setExpandedPinId(null);
      onCloseOverlayRef.current?.();
    });

    mapRef.current = map;

    const markers = markersRef.current;
    const clusterMarkers = clusterMarkersRef.current;
    return () => {
      clearTimeout(debouncedCenterChange.current);
      sourceReady.current = false;
      for (const entry of markers.values()) entry.marker.remove();
      markers.clear();
      for (const entry of clusterMarkers.values()) entry.marker.remove();
      clusterMarkers.clear();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render existing individual markers when expanded state or theme changes
  useEffect(() => {
    if (!sourceReady.current) return;

    const themeMode = (resolvedTheme === 'dark' ? 'dark' : 'light') as 'light' | 'dark';
    const labels = { upcoming: t('upcoming'), active: t('active') };

    for (const [, entry] of markersRef.current) {
      entry.root.render(
        <MapMarker
          pin={entry.pin}
          isExpanded={expandedPinId === entry.pin.id}
          theme={themeMode}
          labels={labels}
          onToggle={() =>
            setExpandedPinId((prev) => (prev === entry.pin.id ? null : entry.pin.id))
          }
          onClose={() => setExpandedPinId(null)}
        />
      );
    }
  }, [expandedPinId, resolvedTheme, t]);

  // Update GeoJSON source data when pins or filters change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !sourceReady.current) return;

    const source = map.getSource(PIN_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData(pinsToGeoJSON(pins, activeFilters, activeTrafficTypes));
    }
  }, [pins, activeFilters, activeTrafficTypes]);

  // Update traffic flow data
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !sourceReady.current) return;
    const source = map.getSource(FLOW_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData(flowToGeoJSON(flowSegments));
    }
  }, [flowSegments]);

  // Fly to target when notification is selected
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyTo) return;

    map.flyTo({ center: [flyTo.lng, flyTo.lat], zoom: flyTo.zoom });

    const handleMoveEnd = () => {
      onFlyToComplete?.();
      map.off('moveend', handleMoveEnd);
    };
    map.once('moveend', handleMoveEnd);
  }, [flyTo, onFlyToComplete]);

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

      // Clear all HTML markers before style swap (sources are destroyed)
      for (const entry of clusterMarkersRef.current.values()) entry.marker.remove();
      clusterMarkersRef.current.clear();
      for (const entry of markersRef.current.values()) entry.marker.remove();
      markersRef.current.clear();

      map.setStyle(newStyle);
      map.once('style.load', () => {
        map.setCenter(savedCenter);
        map.setZoom(savedZoom);
        // Re-add traffic flow layer
        if (!map.getSource(FLOW_SOURCE_ID)) {
          map.addSource(FLOW_SOURCE_ID, createFlowSource(flowToGeoJSON(flowSegments)));
          map.addLayer(TRAFFIC_FLOW_LAYER);
        }
        // Re-add pin source — HTML markers are re-created by syncMarkers
        if (!map.getSource(PIN_SOURCE_ID)) {
          map.addSource(PIN_SOURCE_ID, createPinSource(pinsToGeoJSON(pins, activeFilters, activeTrafficTypes)));
          map.addLayer(PIN_DATA_LAYER);
          sourceReady.current = true;
        }
        if (resolvedTheme === 'dark' && map.getLayer('water')) {
          map.setPaintProperty('water', 'fill-color', '#0E223F');
        }
        // Markers will be re-created by the next moveend / sourcedata event.
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme]);

  return (
    <div className="border-border relative h-full w-full overflow-hidden rounded-xl border">
      <div ref={containerRef} className="bg-background h-full w-full" />

      {isLoading && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center pt-14">
          <div className="bg-background/90 flex items-center gap-2 rounded-full px-3 py-1.5 shadow-sm backdrop-blur-sm">
            <IconLoader2 size={14} className="text-muted animate-spin" />
            <span className="text-muted text-xs">{t('loadingMapData')}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-x-0 top-0 z-20 flex justify-center pt-14">
          <div className="bg-danger/10 flex items-center gap-2 rounded-full px-4 py-2 shadow-sm">
            <span className="text-danger text-xs font-medium">{error}</span>
            {onRetry && (
              <button onClick={onRetry} className="text-danger hover:bg-danger/20 rounded-full p-1">
                <IconRefresh size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {infoOverlay && (
        <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 flex justify-center p-6" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="relative max-w-sm rounded-xl border border-border bg-background/95 p-5 shadow-xl backdrop-blur-sm">
            <button
              onClick={onCloseOverlay}
              className="absolute right-3 top-3 rounded p-1 text-muted transition-colors hover:bg-card hover:text-text-primary"
              aria-label={t('closeOverlay')}
            >
              <IconX size={16} />
            </button>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              {infoOverlay.category}
            </p>
            <p className="mt-1 text-sm font-semibold text-text-primary">
              {infoOverlay.title}
            </p>
            {infoOverlay.description && (
              <p className="mt-2 text-xs text-text-secondary">{infoOverlay.description}</p>
            )}
            <p className="mt-3 text-[11px] text-muted">{t('coversYourArea')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
