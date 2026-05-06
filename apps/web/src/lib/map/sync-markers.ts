import type maplibregl from 'maplibre-gl';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';

import type { RelativeTimeLocale } from '@notifio/shared/format';
import type { MapPin } from '@notifio/shared/map';

import { PIN_SOURCE_ID } from '@/lib/map-config';

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
  /** next-intl locale, threaded as a prop because the marker subtree
   *  is mounted via `createRoot()` and has no provider context. */
  locale: RelativeTimeLocale;
  expandedPinId: string | null;
  labels: { upcoming: string; active: string; viewDetails: string };
  markers: Map<string, MarkerEntry>;
  clusterMarkers: Map<number, ClusterMarkerEntry>;
  renderMarker: (
    root: Root,
    pin: MapPin,
    opts: {
      isExpanded: boolean;
      theme: 'light' | 'dark';
      locale: RelativeTimeLocale;
      labels: { upcoming: string; active: string; viewDetails: string };
      clusterCount?: number;
      onToggle: () => void;
      onClose: () => void;
    },
  ) => void;
  onTogglePin: (pinId: string) => void;
  onClosePin: () => void;
  onSyncAgain: () => void;
  /** F2: cluster tap surfaces resolved leaves to the parent so it can
   *  open the stacked-pin sheet. Replaces the previous zoom-on-tap UX
   *  to mirror mobile (single deterministic action). */
  onClusterTap?: (children: MapPin[]) => void;
}

export function syncMarkers({
  map,
  Marker,
  pins,
  theme,
  locale,
  expandedPinId,
  labels,
  markers,
  clusterMarkers,
  renderMarker,
  onTogglePin,
  onClosePin,
  onSyncAgain,
  onClusterTap,
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

      const handleClusterClick = () => {
        // F2: if a parent registered onClusterTap, surface the leaves
        // and let it open the stacked-pin sheet (mobile parity). If
        // not, fall back to the legacy zoom-in behaviour.
        if (onClusterTap) {
          source
            .getClusterLeaves(clusterId, count, 0)
            .then((leaves) => {
              const matched = leaves
                .map((leaf) => {
                  const id = leaf.properties?.id as string | undefined;
                  return id ? pins.find((p) => p.id === id) : undefined;
                })
                .filter((p): p is MapPin => Boolean(p) && !p!.isTeaser);
              if (matched.length > 0) onClusterTap(matched);
            })
            .catch(() => {
              // Leaf lookup failed — silently no-op.
            });
          return;
        }
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
        locale,
        labels,
        clusterCount: count,
        onToggle: handleClusterClick,
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
                locale,
                labels,
                clusterCount: count,
                onToggle: handleClusterClick,
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
      locale,
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
