import type maplibregl from 'maplibre-gl';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';

import { PIN_SOURCE_ID } from '@/lib/map-config';
import type { MapPin } from '@/lib/normalize-pins';

export interface MarkerEntry {
  marker: maplibregl.Marker;
  root: Root;
  pin: MapPin;
}

export interface ClusterMarkerEntry {
  marker: maplibregl.Marker;
  root: Root;
}

export interface SyncMarkersParams {
  map: maplibregl.Map;
  Marker: typeof maplibregl.Marker;
  pins: MapPin[];
  theme: 'light' | 'dark';
  expandedPinId: string | null;
  labels: { upcoming: string; active: string };
  markers: Map<string, MarkerEntry>;
  clusterMarkers: Map<number, ClusterMarkerEntry>;
  renderMarker: (
    root: Root,
    pin: MapPin,
    opts: {
      isExpanded: boolean;
      theme: 'light' | 'dark';
      labels: { upcoming: string; active: string };
      clusterCount?: number;
      onToggle: () => void;
      onClose: () => void;
    },
  ) => void;
  onTogglePin: (pinId: string) => void;
  onClosePin: () => void;
  onSyncAgain: () => void;
}

export function syncMarkers({
  map,
  Marker,
  pins,
  theme,
  expandedPinId,
  labels,
  markers,
  clusterMarkers,
  renderMarker,
  onTogglePin,
  onClosePin,
  onSyncAgain,
}: SyncMarkersParams): void {
  const features = map.querySourceFeatures(PIN_SOURCE_ID);
  const clusteredFeatures = features.filter((f) => f.properties?.cluster);
  const unclusteredFeatures = features.filter((f) => !f.properties?.cluster);

  // ── Cluster markers ──────────────────────────────────────────────
  const clusters = new Map<number, GeoJSON.Feature>();
  for (const f of clusteredFeatures) {
    clusters.set(f.properties!.cluster_id as number, f);
  }

  // Remove stale cluster markers
  for (const [id, entry] of clusterMarkers) {
    if (!clusters.has(id)) {
      entry.marker.remove();
      clusterMarkers.delete(id);
    }
  }

  for (const [clusterId, feature] of clusters) {
    const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number];
    const count = (feature.properties?.point_count as number) ?? 0;

    const existing = clusterMarkers.get(clusterId);
    if (existing) {
      existing.marker.setLngLat(coords);
    } else {
      const el = document.createElement('div');
      el.style.zIndex = '5';
      const root = createRoot(el);

      const source = map.getSource(PIN_SOURCE_ID) as maplibregl.GeoJSONSource;

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
          map.easeTo({ center: coords, zoom: zoom + 1 });
          map.once('moveend', () => {
            setTimeout(() => onSyncAgain(), 50);
          });
        });
      };

      renderMarker(root, placeholderPin, {
        isExpanded: false,
        theme,
        labels,
        clusterCount: count,
        onToggle: zoomToCluster,
        onClose: () => {},
      });

      const marker = new Marker({ element: el, anchor: 'bottom' })
        .setLngLat(coords)
        .addTo(map);

      clusterMarkers.set(clusterId, { marker, root });

      // Async: resolve first leaf for real pin style
      source
        .getClusterLeaves(clusterId, 1, 0)
        .then((leaves) => {
          const leaf = leaves[0];
          if (leaf?.properties) {
            const leafId = leaf.properties.id as string | undefined;
            const matchedPin = leafId ? pins.find((p) => p.id === leafId) : undefined;
            if (matchedPin) {
              const styledPin: MapPin = {
                ...placeholderPin,
                source: matchedPin.source,
                incidentType: matchedPin.incidentType,
              };
              renderMarker(root, styledPin, {
                isExpanded: false,
                theme,
                labels,
                clusterCount: count,
                onToggle: zoomToCluster,
                onClose: () => {},
              });
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
  for (const [id, entry] of markers) {
    if (!unclusteredIds.has(id)) {
      entry.marker.remove();
      markers.delete(id);
    }
  }

  // Create markers for newly unclustered pins
  for (const pinId of unclusteredIds) {
    if (markers.has(pinId)) continue;

    const pin = pins.find((p) => p.id === pinId);
    if (!pin) continue;

    const el = document.createElement('div');
    const root = createRoot(el);
    renderMarker(root, pin, {
      isExpanded: expandedPinId === pin.id,
      theme,
      labels,
      onToggle: () => onTogglePin(pin.id),
      onClose: onClosePin,
    });
    const marker = new Marker({ element: el, anchor: 'bottom' })
      .setLngLat([pin.lng, pin.lat])
      .addTo(map);
    markers.set(pinId, { marker, root, pin });
  }
}
