import { IconPlus, IconRefresh } from '@tabler/icons-react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import ClusteredMapView from 'react-native-map-clustering';
import { Callout, Marker, Polyline } from 'react-native-maps';
import type MapView from 'react-native-maps';
import type { Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SLOVAKIA_CENTER } from '@notifio/shared/geo';
import { useMembership } from '@notifio/shared/hooks';
import {
  MAP_FILTER_SOURCES,
  TRAFFIC_SUBCATEGORIES,
  type MapPin,
  type MapPinSource,
  type MapPinTrafficType,
} from '@notifio/shared/map';

import { EventReportModal } from '../../components/events/event-report-modal';
import { ClusterEventsSheet } from '../../components/map/cluster-events-sheet';
import { MapClusterMarker } from '../../components/map/map-cluster-marker';
import { MapFilterSheet } from '../../components/map/map-filter-sheet';
import { MapPinMarker, PIN_H } from '../../components/map/map-pin-marker';
import { MapStatusCard } from '../../components/map/map-status-card';
import { PinCallout } from '../../components/map/pin-callout';
import { UpsellSheet } from '../../components/monetization/upsell-sheet';
import { FAB } from '../../components/ui/fab';
import { useMapData } from '../../hooks/use-map-data';
import { DARK_MAP_STYLE } from '../../lib/map-style-dark';
import { shadows, theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

const FILTER_BAR_HEIGHT = 44;
const GPS_DELTA = 0.06;
const FALLBACK_DELTA = 4.0;
const DEBOUNCE_MS = 1500;

const SLOVAKIA_REGION: Region = {
  latitude: SLOVAKIA_CENTER.lat,
  longitude: SLOVAKIA_CENTER.lng,
  latitudeDelta: FALLBACK_DELTA,
  longitudeDelta: FALLBACK_DELTA,
};

const CONGESTION_COLORS: Record<string, string> = {
  free: '#34C759',
  moderate: '#F59E0B',
  heavy: '#FF7A2F',
  severe: '#FF3B30',
};

interface ClusterFeature {
  id: number | string;
  geometry: { coordinates: [number, number] };
  properties?: { point_count?: number };
  onPress?: () => void;
}

export default function MapScreen() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapRef = useRef<MapView | null>(null);

  const [showReportModal, setShowReportModal] = useState(false);
  // Lifecycle visibility (β filter sheet "Show on map" section). Active
  // defaults ON, upcoming defaults OFF. Both flow into useMapData so the
  // shared normalizer drops upcoming pins server-shape-side when toggle
  // is off — and to map's filteredPins for the active toggle.
  const [showActive, setShowActive] = useState(true);
  const [showUpcoming, setShowUpcoming] = useState(false);

  // Step 8: source for the upsell sheet — set by teaser pin taps and
  // locked filter row taps; cleared on close.
  const [upsellSource, setUpsellSource] = useState<MapPinSource | null>(null);

  // Cluster tap → list of children. Solves the identical-coord stack:
  // multiple events at the same lat/lng each get a row in the sheet
  // instead of being unreachable behind the top pin.
  const [clusterChildren, setClusterChildren] = useState<MapPin[]>([]);
  const [clusterSheetOpen, setClusterSheetOpen] = useState(false);
  const { tier } = useMembership();
  const { t } = useTranslation();
  // Mobile's `useMembership` already coerces missing data to FREE, but
  // be explicit so the call site reads the same as web.
  const effectiveTier = (tier ?? 'FREE') as 'FREE' | 'PLUS' | 'PRO';

  const { pins, flowSegments, isLoading, isAutoRefreshing, error, refresh } = useMapData(
    mapCenter,
    { showUpcoming, tier: effectiveTier },
  );

  const [activeFilters, setActiveFilters] = useState<Set<MapPinSource>>(
    () => new Set(MAP_FILTER_SOURCES),
  );
  const [activeTrafficTypes, setActiveTrafficTypes] = useState<Set<MapPinTrafficType>>(
    () => new Set(TRAFFIC_SUBCATEGORIES),
  );

  // Resolve initial region before rendering the map
  useEffect(() => {
    (async () => {
      let region = SLOVAKIA_REGION;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          region = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: GPS_DELTA,
            longitudeDelta: GPS_DELTA,
          };
        }
      } catch {
        // GPS unavailable — use fallback
      }
      setInitialRegion(region);
      setMapCenter({ lat: region.latitude, lng: region.longitude });
    })();
  }, []);

  // Debounced region change handler — 1.5s after pan stops
  const handleRegionChange = useCallback((region: Region) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setMapCenter({ lat: region.latitude, lng: region.longitude });
    }, DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const toggleFilter = useCallback((source: MapPinSource) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(source)) next.delete(source);
      else next.add(source);
      return next;
    });
  }, []);

  const toggleTrafficType = useCallback((type: MapPinTrafficType) => {
    setActiveTrafficTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const filteredPins = useMemo(
    () =>
      pins.filter((p) => {
        if (p.isTeaser) return true; // teasers always render — they're the upsell hook
        // Lifecycle gates. `showUpcoming=false` is also enforced upstream
        // in normalizeMapPins, so this is mostly defense-in-depth for the
        // active toggle (no upstream equivalent for that one).
        if (p.status === 'active' && !showActive) return false;
        if (p.status === 'upcoming' && !showUpcoming) return false;
        if (!activeFilters.has(p.source)) return false;
        if (p.source === 'traffic' && p.incidentType) {
          return activeTrafficTypes.has(p.incidentType as MapPinTrafficType);
        }
        return true;
      }),
    [pins, activeFilters, activeTrafficTypes, showActive, showUpcoming],
  );

  const clearCategoryFilters = useCallback(() => {
    setActiveFilters(new Set(MAP_FILTER_SOURCES));
    setActiveTrafficTypes(new Set(TRAFFIC_SUBCATEGORIES));
  }, []);

  const handleClusterPress = useCallback(
    (
      _cluster: unknown,
      children?: Array<{ geometry?: { coordinates?: [number, number] } }>,
    ) => {
      if (!children || children.length === 0) return;
      // Resolve cluster children → MapPin[] via lat/lng matching.
      // The clustering lib's GeoJSON features don't carry pin.id, so
      // coord equality is the only stable hook back to our pins
      // array. Floating-point safe: coords come unmutated from
      // pin.lat/lng. Teasers filtered out — synthetic IDs would 404
      // on /events/{id}.
      const childCoords = children
        .map((c) => c.geometry?.coordinates)
        .filter((c): c is [number, number] => Array.isArray(c));
      const matched = pins.filter(
        (p) =>
          !p.isTeaser &&
          childCoords.some(([lng, lat]) => p.lat === lat && p.lng === lng),
      );
      if (matched.length === 0) return;
      setClusterChildren(matched);
      setClusterSheetOpen(true);
    },
    [pins],
  );

  const renderCluster = useCallback((cluster: ClusterFeature) => {
    const [longitude, latitude] = cluster.geometry.coordinates;
    const count = cluster.properties?.point_count ?? 0;
    return (
      <Marker
        key={`cluster-${cluster.id}`}
        coordinate={{ latitude, longitude }}
        onPress={cluster.onPress}
        tracksViewChanges={false}
        anchor={{ x: 0.5, y: 1 }}
      >
        <MapClusterMarker count={count} />
      </Marker>
    );
  }, []);

  const loadingPillBg = isDark ? 'rgba(14, 34, 63, 0.9)' : 'rgba(255, 255, 255, 0.9)';
  const showLoadingPill = isLoading || isAutoRefreshing;

  // Wait until we know the initial region before mounting the map
  if (!initialRegion) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ClusteredMapView
        style={styles.map}
        initialRegion={initialRegion}
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation
        showsMyLocationButton
        radius={80}
        extent={512}
        spiralEnabled={false}
        // Skip the lib's auto fitToCoordinates — we open a list sheet
        // instead so identical-coord events are still reachable.
        preserveClusterPressBehavior
        mapRef={(ref) => { mapRef.current = ref as unknown as MapView | null; }}
        onClusterPress={handleClusterPress}
        renderCluster={renderCluster}
        // iOS Apple Maps native dark mode
        userInterfaceStyle={isDark ? 'dark' : 'light'}
        // Android Google Maps custom dark style
        customMapStyle={Platform.OS === 'android' && isDark ? DARK_MAP_STYLE : undefined}
      >
        {/* Flow polylines are gated by the `traffic` filter row so the
            user controls them from one place. Free-flow segments are
            hidden (matches web's flowToGeoJSON filter) — only actual
            congestion shows, with a softer stroke than before. */}
        {activeFilters.has('traffic') && flowSegments
          .filter((segment) => segment.congestion !== 'free')
          .map((segment, idx) => (
            <Polyline
              key={`flow-${idx}`}
              coordinates={segment.coordinates.map(([lng, lat]) => ({
                latitude: lat,
                longitude: lng,
              }))}
              strokeColor={CONGESTION_COLORS[segment.congestion] ?? CONGESTION_COLORS.moderate}
              strokeWidth={2}
            />
          ))}
        {filteredPins.map((pin) => (
          <PinMarker
            key={pin.id}
            pin={pin}
            onTeaserPress={setUpsellSource}
            onCalloutPress={(p) => router.push(`/events/${p.id}`)}
          />
        ))}
      </ClusteredMapView>

      <MapFilterSheet
        activeFilters={activeFilters}
        activeTrafficTypes={activeTrafficTypes}
        onToggle={toggleFilter}
        onToggleTrafficType={toggleTrafficType}
        pins={pins}
        topInset={insets.top}
        tier={effectiveTier}
        onLockedRowTap={setUpsellSource}
        showActive={showActive}
        showUpcoming={showUpcoming}
        onToggleShowActive={setShowActive}
        onToggleShowUpcoming={setShowUpcoming}
        onClearCategoryFilters={clearCategoryFilters}
      />

      <UpsellSheet source={upsellSource} onClose={() => setUpsellSource(null)} />

      <ClusterEventsSheet
        visible={clusterSheetOpen}
        events={clusterChildren}
        onClose={() => setClusterSheetOpen(false)}
      />

      {showLoadingPill && (
        <View style={[styles.statusOverlay, { top: insets.top + FILTER_BAR_HEIGHT }]} pointerEvents="none">
          <View style={[styles.loadingPill, { backgroundColor: loadingPillBg }]}>
            <ActivityIndicator size="small" color={colors.textMuted} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              {isAutoRefreshing ? t('map.refreshing') : t('map.loadingData')}
            </Text>
          </View>
        </View>
      )}

      {error && (
        <View style={[styles.statusOverlay, { top: insets.top + FILTER_BAR_HEIGHT }]}>
          <View style={[styles.errorBanner, { backgroundColor: colors.severity.critical.bg }]}>
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            <Pressable onPress={refresh} style={styles.retryButton}>
              <IconRefresh size={14} color={colors.danger} />
            </Pressable>
          </View>
        </View>
      )}

      <MapStatusCard alertCount={filteredPins.length} />

      {/* FAB — Report event */}
      <FAB icon={IconPlus} onPress={() => setShowReportModal(true)} bottom={100} />

      <EventReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        onCreated={refresh}
        initialCenter={mapCenter ?? undefined}
      />
    </View>
  );
}

/**
 * Per-pin Marker wrapper. Holds `tracksViewChanges=true` for the first
 * render tick so RN-maps registers the marker bitmap and a stable hit
 * target, then flips to false to stop re-snapshotting on every region
 * change. Without this, taps on pins were missed about 30% of the time
 * — especially on Android — because the Marker's underlying view never
 * re-tracked after the initial mount and its hit-test rect went stale.
 */
const PinMarker = memo(function PinMarker({
  pin,
  onTeaserPress,
  onCalloutPress,
}: {
  pin: MapPin;
  onTeaserPress: (source: MapPinSource) => void;
  onCalloutPress: (pin: MapPin) => void;
}) {
  const [tracks, setTracks] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setTracks(false), 600);
    return () => clearTimeout(id);
  }, []);

  return (
    <Marker
      coordinate={{ latitude: pin.lat, longitude: pin.lng }}
      tracksViewChanges={tracks}
      anchor={{ x: 0.5, y: 1 }}
      // RN-maps quirk: `anchor` is silently ignored on iOS for
      // children-based (non-image) markers. Without `centerOffset` the
      // marker's center sits on the coord, putting the pin tip ~25pt
      // below the actual location. centerOffset is iOS-only — Android
      // ignores it and uses `anchor` (which works there).
      centerOffset={{ x: 0, y: -PIN_H / 2 }}
      // Step 8: teaser pins skip the callout entirely and route taps to
      // the upsell sheet so the user finds out why coverage is greyed
      // out. Non-teasers get a no-op press handler — that forces the
      // marker to claim the touch responder reliably (works around
      // RN-maps callout flakiness when no onPress is set).
      onPress={pin.isTeaser ? () => onTeaserPress(pin.source) : () => {}}
      // Any non-teaser pin with a valid id navigates to /events/{id}.
      // Post-M2 audit: traffic pins now arrive via /events with UUIDs
      // (previously dual-sourced from /traffic with TomTom ids — the
      // duplicate path was dropped at the hook level).
      onCalloutPress={
        !pin.isTeaser && pin.id ? () => onCalloutPress(pin) : undefined
      }
    >
      <MapPinMarker pin={pin} />
      {!pin.isTeaser && (
        <Callout tooltip>
          <PinCallout pin={pin} />
        </Callout>
      )}
    </Marker>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    flex: 1,
  },
  statusOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  loadingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    ...shadows.sm,
  },
  loadingText: {
    fontSize: theme.fontSize.xs,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    ...shadows.sm,
  },
  errorText: {
    fontSize: theme.fontSize.xs,
    ...theme.font.medium,
  },
  retryButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.radius.full,
  },
});
