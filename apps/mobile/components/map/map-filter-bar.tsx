import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MAP_FILTER_SOURCES, MAP_PIN_STYLES } from '../../lib/map-pin-config';
import type { MapPin, MapPinSource } from '../../lib/normalize-pins';
import { theme } from '../../lib/theme';

interface MapFilterBarProps {
  activeFilters: Set<MapPinSource>;
  onToggle: (source: MapPinSource) => void;
  pins: MapPin[];
  topInset?: number;
}

export function MapFilterBar({ activeFilters, onToggle, pins, topInset = 0 }: MapFilterBarProps) {
  const counts = useMemo(() => {
    const map = new Map<MapPinSource, number>();
    for (const pin of pins) {
      map.set(pin.source, (map.get(pin.source) ?? 0) + 1);
    }
    return map;
  }, [pins]);

  return (
    <View style={[styles.container, { top: topInset + theme.spacing.sm }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {MAP_FILTER_SOURCES.map((source) => {
          const pinStyle = MAP_PIN_STYLES[source];
          const isActive = activeFilters.has(source);
          const count = counts.get(source) ?? 0;

          return (
            <Pressable
              key={source}
              onPress={() => onToggle(source)}
              style={[
                styles.pill,
                isActive
                  ? { backgroundColor: pinStyle.color }
                  : styles.pillInactive,
              ]}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: isActive ? '#FFFFFF' : pinStyle.color },
                ]}
              />
              <Text
                style={[
                  styles.label,
                  { color: isActive ? '#FFFFFF' : theme.colors.textMuted },
                ]}
              >
                {pinStyle.label}
                {count > 0 ? ` (${count})` : ''}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    zIndex: 10,
  },
  scrollContent: {
    gap: theme.spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
  },
  pillInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: theme.radius.full,
  },
  label: {
    fontSize: theme.fontSize.xs,
    ...theme.font.medium,
  },
});
