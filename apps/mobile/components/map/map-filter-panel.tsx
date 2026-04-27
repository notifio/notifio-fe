import { IconAdjustments, IconInfoCircle, IconX } from '@tabler/icons-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutAnimation, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { sharedColors } from '@notifio/ui';

import { CategoryIcon } from './category-icon';
import { MapToggle } from './map-toggle';
import {
  MAP_FILTER_SOURCES,
  MAP_PIN_STYLES,
  TRAFFIC_ICON_MAP,
  TRAFFIC_SUBCATEGORIES,
  TRAFFIC_TYPE_COLORS,
  type TrafficIncidentType,
} from '../../lib/map-pin-config';
import type { MapPin, MapPinSource } from '../../lib/normalize-pins';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';
import { AdPlaceholder } from '../monetization/ad-placeholder';

interface MapFilterPanelProps {
  activeFilters: Set<MapPinSource>;
  activeTrafficTypes: Set<TrafficIncidentType>;
  onToggle: (source: MapPinSource) => void;
  onToggleTrafficType: (type: TrafficIncidentType) => void;
  pins: MapPin[];
  topInset?: number;
}

export function MapFilterPanel({
  activeFilters,
  activeTrafficTypes,
  onToggle,
  onToggleTrafficType,
  pins,
  topInset = 0,
}: MapFilterPanelProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Glass surface — solid translucent (no native backdrop blur on RN; the
  // dark navy / soft white reads cleanly against either map style).
  const glassBg = isDark ? 'rgba(14,34,63,0.92)' : 'rgba(255,255,255,0.95)';
  const glassBorder = isDark ? 'rgba(31,58,95,0.7)' : 'rgba(226,232,240,0.9)';
  const dividerColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(14,34,63,0.08)';
  const countColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(14,34,63,0.45)';

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

  const togglePanel = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen((v) => !v);
  };

  return (
    <View style={[styles.root, { top: topInset + theme.spacing.sm }]}>
      {!isOpen && (
        <Pressable
          onPress={togglePanel}
          style={[styles.collapsedButton, { backgroundColor: glassBg, borderColor: glassBorder }]}
        >
          <IconAdjustments size={18} color={colors.text} />
          <Text style={[styles.collapsedLabel, { color: colors.text }]}>
            {t('mapFilters.title')}
          </Text>
          {hasInactiveFilters && <View style={styles.indicatorDot} />}
        </Pressable>
      )}

      {isOpen && (
        <View style={[styles.panel, { backgroundColor: glassBg, borderColor: glassBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerLabel, { color: colors.text }]}>
              {t('mapFilters.title')}
            </Text>
            <Pressable onPress={togglePanel} hitSlop={8} style={styles.closeButton}>
              <IconX size={16} color={colors.text} style={styles.closeIcon} />
            </Pressable>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {MAP_FILTER_SOURCES.map((source) => {
              const style = MAP_PIN_STYLES[source];
              const isActive = activeFilters.has(source);
              const count = sourceCounts.get(source) ?? 0;
              const isTraffic = source === 'traffic';

              return (
                <View key={source}>
                  {isTraffic && <View style={[styles.divider, { backgroundColor: dividerColor }]} />}

                  <View style={styles.row}>
                    <CategoryIcon
                      icon={style.icon}
                      color={style.color}
                      isDark={isDark}
                      size={40}
                      iconSize={22}
                      radius={10}
                    />
                    <Text style={[styles.rowLabel, { color: colors.text }]} numberOfLines={1}>
                      {t(style.label)}
                    </Text>
                    <Text style={[styles.count, { color: countColor }]}>{count}</Text>
                    <MapToggle
                      on={isActive}
                      onToggle={() => onToggle(source)}
                      partial={isTraffic && trafficIsPartial}
                      isDark={isDark}
                    />
                  </View>

                  {/* Traffic subcategories */}
                  {isTraffic && trafficIsActive && trafficSubsWithData.length > 0 && (
                    <View>
                      {trafficSubsWithData.map((type) => {
                        const subCount = trafficTypeCounts.get(type) ?? 0;
                        const subActive = activeTrafficTypes.has(type);
                        const SubIcon = TRAFFIC_ICON_MAP[type] ?? IconInfoCircle;
                        const subColor = TRAFFIC_TYPE_COLORS[type] ?? '#6B7A99';

                        return (
                          <View key={type} style={styles.subRow}>
                            <CategoryIcon
                              icon={SubIcon}
                              color={subColor}
                              isDark={isDark}
                              size={32}
                              iconSize={18}
                              radius={6}
                            />
                            <Text
                              style={[styles.subRowLabel, { color: colors.text }]}
                              numberOfLines={1}
                            >
                              {t(`mapFilters.${type}`)}
                            </Text>
                            <Text style={[styles.count, { color: countColor }]}>{subCount}</Text>
                            <MapToggle
                              on={subActive}
                              onToggle={() => onToggleTrafficType(type)}
                              isDark={isDark}
                              small
                            />
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>

          {/* Ad placement (FREE only — AdPlaceholder returns null otherwise) */}
          <View style={styles.adWrap}>
            <AdPlaceholder variant="inline" />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: theme.spacing.lg,
    zIndex: 10,
    maxWidth: 280,
  },
  collapsedButton: {
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
  collapsedLabel: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: sharedColors.accent,
  },
  panel: {
    width: 260,
    borderRadius: theme.radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    maxHeight: 560,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  headerLabel: {
    fontSize: theme.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.6,
    ...theme.font.medium,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    opacity: 0.5,
  },
  scroll: {
    maxHeight: 420,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 48,
  },
  rowLabel: {
    flex: 1,
    fontSize: theme.fontSize.sm,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingLeft: theme.spacing['3xl'],
    paddingRight: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    minHeight: 40,
  },
  subRowLabel: {
    flex: 1,
    fontSize: theme.fontSize.xs,
    opacity: 0.75,
  },
  count: {
    fontSize: theme.fontSize.xs,
    marginRight: theme.spacing.xs,
  },
  adWrap: {
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
});
