import { IconAdjustments } from '@tabler/icons-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { sharedColors } from '@notifio/ui';

import { FilterRow } from './filter-row';
import {
  MAP_FILTER_SOURCES,
  TRAFFIC_SUBCATEGORIES,
  type TrafficIncidentType,
} from '../../lib/map-pin-config';
import type { MapPin, MapPinSource } from '../../lib/normalize-pins';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';
import { AdPlaceholder } from '../monetization/ad-placeholder';
import { BottomSheet } from '../ui/bottom-sheet';

interface MapFilterSheetProps {
  activeFilters: Set<MapPinSource>;
  activeTrafficTypes: Set<TrafficIncidentType>;
  onToggle: (source: MapPinSource) => void;
  onToggleTrafficType: (type: TrafficIncidentType) => void;
  pins: MapPin[];
  topInset?: number;
  tier?: 'FREE' | 'PLUS' | 'PRO';
  onLockedRowTap?: (source: MapPinSource) => void;
}

export function MapFilterSheet({
  activeFilters,
  activeTrafficTypes,
  onToggle,
  onToggleTrafficType,
  pins,
  topInset = 0,
  tier = 'FREE',
  onLockedRowTap,
}: MapFilterSheetProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const triggerBg = isDark ? 'rgba(14,34,63,0.92)' : 'rgba(255,255,255,0.95)';
  const triggerBorder = isDark ? 'rgba(31,58,95,0.7)' : 'rgba(226,232,240,0.9)';

  const sourceCounts = useMemo(() => {
    const map = new Map<MapPinSource, number>();
    for (const pin of pins) {
      map.set(pin.source, (map.get(pin.source) ?? 0) + 1);
    }
    return map;
  }, [pins]);

  const trafficTypeCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const pin of pins) {
      if (pin.source === 'traffic') {
        const type = pin.incidentType ?? 'other';
        map.set(type, (map.get(type) ?? 0) + 1);
      }
    }
    return map;
  }, [pins]);

  const totalSources = MAP_FILTER_SOURCES.length;
  const activeCount = MAP_FILTER_SOURCES.filter((s) => activeFilters.has(s)).length;
  const hasInactiveFilters = activeCount < totalSources;

  const trafficIsActive = activeFilters.has('traffic');
  const trafficSubsWithData = TRAFFIC_SUBCATEGORIES.filter(
    (type) => (trafficTypeCounts.get(type) ?? 0) > 0,
  );
  const activeTrafficSubCount = trafficSubsWithData.filter((type) =>
    activeTrafficTypes.has(type),
  ).length;
  const trafficIsPartial =
    trafficIsActive &&
    activeTrafficSubCount > 0 &&
    activeTrafficSubCount < trafficSubsWithData.length;

  return (
    <>
      <View style={[styles.triggerRoot, { top: topInset + theme.spacing.sm }]}>
        <Pressable
          onPress={() => setIsOpen(true)}
          style={[
            styles.triggerButton,
            { backgroundColor: triggerBg, borderColor: triggerBorder },
          ]}
        >
          <IconAdjustments size={18} color={colors.text} />
          <Text style={[styles.triggerLabel, { color: colors.text }]}>
            {t('mapFilters.title')}
          </Text>
          {hasInactiveFilters && <View style={styles.indicatorDot} />}
        </Pressable>
      </View>

      <BottomSheet
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        title={t('mapFilters.title')}
        maxHeight="85%"
        minHeight="50%"
        scrollable
      >
        <View style={styles.bodyContent}>
          {MAP_FILTER_SOURCES.map((source) => (
            <FilterRow
              key={source}
              source={source}
              isActive={activeFilters.has(source)}
              count={sourceCounts.get(source) ?? 0}
              tier={tier}
              onToggle={onToggle}
              onLockedRowTap={onLockedRowTap}
              trafficSubsWithData={trafficSubsWithData}
              trafficTypeCounts={trafficTypeCounts}
              activeTrafficTypes={activeTrafficTypes}
              trafficIsActive={trafficIsActive}
              trafficIsPartial={trafficIsPartial}
              onToggleTrafficType={onToggleTrafficType}
            />
          ))}
          <View style={styles.adWrap}>
            <AdPlaceholder variant="inline" />
          </View>
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  triggerRoot: {
    position: 'absolute',
    left: theme.spacing.lg,
    zIndex: 10,
  },
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  triggerLabel: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: sharedColors.accent,
  },
  bodyContent: {
    paddingVertical: theme.spacing.xs,
  },
  adWrap: {
    paddingHorizontal: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
});
