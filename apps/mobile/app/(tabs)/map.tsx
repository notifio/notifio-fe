import { IconPlus, IconRefresh } from '@tabler/icons-react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import ClusteredMapView from 'react-native-map-clustering';
import { Callout, Marker } from 'react-native-maps';
import type { Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EventReportModal } from '../../components/events/event-report-modal';
import { MapFilterBar } from '../../components/map/map-filter-bar';
import { MapStatusCard } from '../../components/map/map-status-card';
import { OutageMarker } from '../../components/map/outage-marker';
import { PinCallout } from '../../components/map/pin-callout';
import { useMapData } from '../../hooks/use-map-data';
import { MAP_FILTER_SOURCES } from '../../lib/map-pin-config';
import type { MapPinSource } from '../../lib/normalize-pins';
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

export default function MapScreen() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { pins, isLoading, isAutoRefreshing, error, refresh } = useMapData(mapCenter);
  const [showReportModal, setShowReportModal] = useState(false);

  const [activeFilters, setActiveFilters] = useState<Set<MapPinSource>>(
    () => new Set(MAP_FILTER_SOURCES),
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
      if (next.has(source)) {
        next.delete(source);
      } else {
        next.add(source);
      }
      return next;
    });
  }, []);

  const filteredPins = useMemo(
    () => pins.filter((p) => activeFilters.has(p.source)),
    [pins, activeFilters],
  );

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
        clusterColor={colors.textMuted}
        radius={50}
        extent={512}
      >
        {filteredPins.map((pin) => (
          <Marker
            key={pin.id}
            coordinate={{ latitude: pin.lat, longitude: pin.lng }}
            tracksViewChanges={false}
            onCalloutPress={pin.source === 'event' ? () => router.push(`/events/${pin.id}`) : undefined}
          >
            <OutageMarker pin={pin} />
            <Callout tooltip>
              <PinCallout pin={pin} />
            </Callout>
          </Marker>
        ))}
      </ClusteredMapView>

      <MapFilterBar activeFilters={activeFilters} onToggle={toggleFilter} pins={pins} topInset={insets.top} />

      {showLoadingPill && (
        <View style={[styles.statusOverlay, { top: insets.top + FILTER_BAR_HEIGHT }]} pointerEvents="none">
          <View style={[styles.loadingPill, { backgroundColor: loadingPillBg }]}>
            <ActivityIndicator size="small" color={colors.textMuted} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              {isAutoRefreshing ? 'Refreshing...' : 'Loading map data...'}
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
