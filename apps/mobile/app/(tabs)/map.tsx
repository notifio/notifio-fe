import { IconPlus, IconRefresh } from '@tabler/icons-react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import ClusteredMapView from 'react-native-map-clustering';
import { Callout, Marker, Polyline } from 'react-native-maps';
import type MapView from 'react-native-maps';
import type { Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EventReportModal } from '../../components/events/event-report-modal';
import { ClusterEventsSheet } from '../../components/map/cluster-events-sheet';
import { MapClusterMarker } from '../../components/map/map-cluster-marker';
import { MapFilterSheet } from '../../components/map/map-filter-sheet';
import { MapPinMarker } from '../../components/map/map-pin-marker';
import { MapStatusCard } from '../../components/map/map-status-card';
import { PinCallout } from '../../components/map/pin-callout';
import { UpsellSheet } from '../../components/monetization/upsell-sheet';
import { useMapData } from '../../hooks/use-map-data';
import { useMembership } from '../../hooks/use-membership';
import {
  MAP_FILTER_SOURCES,
  TRAFFIC_SUBCATEGORIES,
  type TrafficIncidentType,
} from '../../lib/map-pin-config';
import { DARK_MAP_STYLE } from '../../lib/map-style-dark';
import type { MapPin, MapPinSource } from '../../lib/normalize-pins';
import { shadows, theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

const FILTER_BAR_HEIGHT = 44;
const GPS_DELTA = 0.06;
const FALLBACK_DELTA = 4.0;
const DEBOUNCE_MS = 1500;

const SLOVAKIA_REGION: Region = {
  latitude: 48.67,
  longitude: 19.70,
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

  const { pins, flowSegments, isLoading, isAutoRefreshing, error, refresh } = useMapData(mapCenter);
  const [showReportModal, setShowReportModal] = useState(false);

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

  const [activeFilters, setActiveFilters] = useState<Set<MapPinSource>>(
    () => new Set(MAP_FILTER_SOURCES),
  );
  const [activeTrafficTypes, setActiveTrafficTypes] = useState<Set<TrafficIncidentType>>(
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

  const toggleTrafficType = useCallback((type: TrafficIncidentType) => {
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
        if (!activeFilters.has(p.source)) return false;
        if (p.source === 'traffic' && p.incidentType) {
          return activeTrafficTypes.has(p.incidentType as TrafficIncidentType);
        }
        return true;
      }),
    [pins, activeFilters, activeTrafficTypes],
  );

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
          <Marker
            key={pin.id}
            coordinate={{ latitude: pin.lat, longitude: pin.lng }}
            tracksViewChanges={false}
            anchor={{ x: 0.5, y: 1 }}
            // Step 8: teaser pins skip the callout entirely and route
            // taps to the upsell sheet so the user finds out why
            // coverage is greyed out.
            onPress={pin.isTeaser ? () => setUpsellSource(pin.source) : undefined}
            // Any non-teaser pin whose id maps to /events/{id} navigates
            // on callout tap. Traffic excluded because pin.id is a
            // TomTom incidentId, not an eventId.
            onCalloutPress={
              !pin.isTeaser && pin.source !== 'traffic' && pin.id
                ? () => router.push(`/events/${pin.id}`)
                : undefined
            }
          >
            <MapPinMarker pin={pin} />
            {!pin.isTeaser && (
              <Callout tooltip>
                <PinCallout pin={pin} />
              </Callout>
            )}
          </Marker>
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
      <View style={styles.fabContainer}>
        <Pressable
          onPress={() => setShowReportModal(true)}
          style={[styles.fab, { backgroundColor: colors.primary }]}
        >
          <IconPlus size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <EventReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        onCreated={refresh}
        initialCenter={mapCenter ?? undefined}
      />
    </View>
  );
}

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
  fabContainer: {
    position: 'absolute',
    right: theme.spacing.xl,
    bottom: 100,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
