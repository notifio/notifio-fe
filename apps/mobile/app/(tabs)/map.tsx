import { RefreshCw } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import ClusteredMapView from 'react-native-map-clustering';
import { Callout, Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MapFilterBar } from '../../components/map/map-filter-bar';
import { MapStatusCard } from '../../components/map/map-status-card';
import { OutageMarker } from '../../components/map/outage-marker';
import { PinCallout } from '../../components/map/pin-callout';
import { useMapData } from '../../hooks/use-map-data';
import { MAP_FILTER_SOURCES } from '../../lib/map-pin-config';
import type { MapPinSource } from '../../lib/normalize-pins';
import { shadows, theme } from '../../lib/theme';

const FILTER_BAR_HEIGHT = 44;

const BRATISLAVA = {
  latitude: 48.1486,
  longitude: 17.1077,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { pins, isLoading, error, refresh } = useMapData();
  const [activeFilters, setActiveFilters] = useState<Set<MapPinSource>>(
    () => new Set(MAP_FILTER_SOURCES),
  );

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

  return (
    <View style={styles.container}>
      <ClusteredMapView
        style={styles.map}
        initialRegion={BRATISLAVA}
        showsUserLocation
        showsMyLocationButton
        clusterColor={theme.colors.textMuted}
        radius={50}
        extent={512}
      >
        {filteredPins.map((pin) => (
          <Marker
            key={pin.id}
            coordinate={{ latitude: pin.lat, longitude: pin.lng }}
            tracksViewChanges={false}
          >
            <OutageMarker pin={pin} />
            <Callout tooltip>
              <PinCallout pin={pin} />
            </Callout>
          </Marker>
        ))}
      </ClusteredMapView>

      <MapFilterBar activeFilters={activeFilters} onToggle={toggleFilter} pins={pins} topInset={insets.top} />

      {isLoading && (
        <View style={[styles.statusOverlay, { top: insets.top + FILTER_BAR_HEIGHT }]} pointerEvents="none">
          <View style={styles.loadingPill}>
            <ActivityIndicator size="small" color={theme.colors.textMuted} />
            <Text style={styles.loadingText}>Loading map data…</Text>
          </View>
        </View>
      )}

      {error && (
        <View style={[styles.statusOverlay, { top: insets.top + FILTER_BAR_HEIGHT }]}>
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={refresh} style={styles.retryButton}>
              <RefreshCw size={14} color={theme.colors.danger} />
            </Pressable>
          </View>
        </View>
      )}

      <MapStatusCard alertCount={filteredPins.length} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    ...shadows.sm,
  },
  loadingText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    ...shadows.sm,
  },
  errorText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.danger,
    ...theme.font.medium,
  },
  retryButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.radius.full,
  },
});
