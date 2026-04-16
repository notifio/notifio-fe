'use client';

import { IconLoader2, IconRefresh, IconX } from '@tabler/icons-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';

import type { TrafficFlowResponse } from '@notifio/api-client';

import { TILE_DARK, TILE_LIGHT } from '@/lib/map-config';
import type { MapPin, MapPinSource, TrafficIncidentType } from '@/lib/normalize-pins';

import { MapMarker } from './map-marker';

const DEFAULT_ZOOM = 13;
const FALLBACK_ZOOM = 7;
const SOURCE_ID = 'pins';
const FLOW_SOURCE_ID = 'traffic-flow';

const CLUSTER_MAX_ZOOM = 14;
const CLUSTER_RADIUS = 80;

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
  const markersRef = useRef<
    Map<string, { marker: maplibregl.Marker; root: Root; pin: MapPin }>
  >(new Map());
  const clusterMarkersRef = useRef<Map<number, { marker: maplibregl.Marker; root: Root }>>(
    new Map()
  );
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
  // Single function drives BOTH cluster and individual markers from
  // querySourceFeatures so MapLibre's clustering is the source of truth.
  const syncMarkers = useRef((map: maplibregl.Map) => {
    if (!sourceReady.current) return;

    const features = map.querySourceFeatures(SOURCE_ID);
    const clusteredFeatures = features.filter((f) => f.properties?.cluster);
    const unclusteredFeatures = features.filter((f) => !f.properties?.cluster);

    const currentPins = pinsRef.current;
    const themeMode = (themeRef.current === 'dark' ? 'dark' : 'light') as 'light' | 'dark';
    const expandedId = expandedPinIdRef.current;
    const translate = tRef.current;
    const labels = { scheduled: translate('scheduled'), active: translate('active') };

    // ── Cluster markers ──────────────────────────────────────────────
    const clusters = new Map<number, GeoJSON.Feature>();
    for (const f of clusteredFeatures) {
      clusters.set(f.properties!.cluster_id as number, f);
    }

    // Remove stale cluster markers
    for (const [id, entry] of clusterMarkersRef.current) {
      if (!clusters.has(id)) {
        entry.marker.remove();
        clusterMarkersRef.current.delete(id);
      }
    }

    for (const [clusterId, feature] of clusters) {
      const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number];
      const count = (feature.properties?.point_count as number) ?? 0;

      const existing = clusterMarkersRef.current.get(clusterId);
      if (existing) {
        existing.marker.setLngLat(coords);
      } else {
        const el = document.createElement('div');
        el.style.zIndex = '5';
        const root = createRoot(el);

        const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;

        const placeholderPin: MapPin = {
          id: `cluster-${clusterId}`,
          source: 'traffic',
          status: 'active',
          lat: coords[1],
          lng: coords[0],
          title: '',
          description: '',
          timestamp: new Date().toISOString(),
        };

        const zoomToCluster = () => {
          source.getClusterExpansionZoom(clusterId).then((zoom) => {
            // Zoom one level past expansion so cluster fully dissolves
            map.easeTo({ center: coords, zoom: zoom + 1 });
            // Force a re-sync after the animation completes to clean up stale cluster markers
            map.once('moveend', () => {
              // Small delay for GeoJSON source to re-tile at the new zoom level
              setTimeout(() => syncMarkers.current(map), 50);
            });
          });
        };

        root.render(
          <MapMarker
            pin={placeholderPin}
            isExpanded={false}
            theme={themeMode}
            labels={labels}
            clusterCount={count}
            onToggle={zoomToCluster}
            onClose={() => {}}
          />
        );

        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat(coords)
          .addTo(map);

        clusterMarkersRef.current.set(clusterId, { marker, root });

        // Async: resolve first leaf for real pin style
        source
          .getClusterLeaves(clusterId, 1, 0)
          .then((leaves) => {
            const leaf = leaves[0];
            if (leaf?.properties) {
              const leafId = leaf.properties.id as string | undefined;
              const matchedPin = leafId ? currentPins.find((p) => p.id === leafId) : undefined;
              if (matchedPin) {
                const styledPin: MapPin = {
                  ...placeholderPin,
                  source: matchedPin.source,
                  incidentType: matchedPin.incidentType,
                };
                root.render(
                  <MapMarker
                    pin={styledPin}
                    isExpanded={false}
                    theme={themeMode}
                    labels={labels}
                    clusterCount={count}
                    onToggle={zoomToCluster}
                    onClose={() => {}}
                  />
                );
              }
            }
          })
          .catch(() => {
            // Leaf lookup failed — keep default style
          });
      }
    }

    // ── Individual pin markers (unclustered only) ────────────────────
    const unclusteredIds = new Set<string>();
    for (const f of unclusteredFeatures) {
      const id = f.properties?.id as string | undefined;
      if (id) unclusteredIds.add(id);
    }

    // Remove markers for pins that are now clustered or filtered out
    for (const [id, entry] of markersRef.current) {
      if (!unclusteredIds.has(id)) {
        entry.marker.remove();
        markersRef.current.delete(id);
      }
    }

    // Create markers for newly unclustered pins
    for (const pinId of unclusteredIds) {
      if (markersRef.current.has(pinId)) continue;

      const pin = currentPins.find((p) => p.id === pinId);
      if (!pin) continue;

      const el = document.createElement('div');
      const root = createRoot(el);
      root.render(
        <MapMarker
          pin={pin}
          isExpanded={expandedId === pin.id}
          theme={themeMode}
          labels={labels}
          onToggle={() => setExpandedPinId((prev) => (prev === pin.id ? null : pin.id))}
          onClose={() => setExpandedPinId(null)}
        />
      );
      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([pin.lng, pin.lat])
        .addTo(map);
      markersRef.current.set(pinId, { marker, root, pin });
    }
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
            'match',
            ['get', 'congestion'],
            'moderate',
            '#EAB308',
            'heavy',
            '#FF7A2F',
            'severe',
            '#FF3B30',
            '#EAB308',
          ],
          'line-width': ['match', ['get', 'congestion'], 'moderate', 3, 'heavy', 4, 'severe', 5, 3],
          'line-opacity': 0.75,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      });

      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: pinsToGeoJSON(pins, activeFilters, activeTrafficTypes),
        cluster: true,
        clusterMaxZoom: CLUSTER_MAX_ZOOM,
        clusterRadius: CLUSTER_RADIUS,
      });
      map.addLayer({
        id: 'pin-data',
        type: 'circle',
        source: SOURCE_ID,
        paint: {
          'circle-radius': 0,
          'circle-opacity': 0,
        },
      });

      sourceReady.current = true;

      if (resolvedTheme === 'dark' && map.getLayer('water')) {
        map.setPaintProperty('water', 'fill-color', '#0E223F');
      }

      // Initial sync after source is ready
      syncMarkers.current(map);
    });

    // Re-sync when viewport changes or source data updates
    map.on('moveend', () => {
      syncMarkers.current(map);
      // Debounced center change callback for dynamic data loading
      clearTimeout(debouncedCenterChange.current);
      debouncedCenterChange.current = setTimeout(() => {
        const c = map.getCenter();
        onCenterChangeRef.current?.({ lat: c.lat, lng: c.lng });
      }, 1500);
    });
    map.on('sourcedata', (e) => {
      if (e.sourceId === SOURCE_ID && sourceReady.current) {
        syncMarkers.current(map);
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
    const labels = { scheduled: t('scheduled'), active: t('active') };

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

    const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
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
                'match',
                ['get', 'congestion'],
                'moderate',
                '#EAB308',
                'heavy',
                '#FF7A2F',
                'severe',
                '#FF3B30',
                '#EAB308',
              ],
              'line-width': [
                'match',
                ['get', 'congestion'],
                'moderate',
                3,
                'heavy',
                4,
                'severe',
                5,
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
        // Re-add pin source — HTML markers are re-created by syncMarkers
        if (!map.getSource(SOURCE_ID)) {
          map.addSource(SOURCE_ID, {
            type: 'geojson',
            data: pinsToGeoJSON(pins, activeFilters, activeTrafficTypes),
            cluster: true,
            clusterMaxZoom: CLUSTER_MAX_ZOOM,
            clusterRadius: CLUSTER_RADIUS,
          });
          map.addLayer({
            id: 'pin-data',
            type: 'circle',
            source: SOURCE_ID,
            paint: {
              'circle-radius': 0,
              'circle-opacity': 0,
            },
          });
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
