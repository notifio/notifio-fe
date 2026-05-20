import { IconLock } from '@tabler/icons-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  SOURCE_REQUIRED_TIER,
  TRAFFIC_ICON_MAP,
  TRAFFIC_TYPE_COLORS,
  type MapPinSource,
  type MapPinTrafficType,
} from '@notifio/shared/map';

import { CategoryIcon } from './category-icon';
import { MapToggle } from './map-toggle';
import { getIconByName } from '../../lib/icon-registry';
import { MAP_PIN_STYLES } from '../../lib/map-pin-config';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';
import { TierBadge } from '../ui/tier-badge';

const TIER_ORDER: Record<'FREE' | 'PLUS' | 'PRO', number> = { FREE: 0, PLUS: 1, PRO: 2 };

interface FilterRowProps {
  source: MapPinSource;
  isActive: boolean;
  count: number;
  tier: 'FREE' | 'PLUS' | 'PRO';
  onToggle: (source: MapPinSource) => void;
  onLockedRowTap?: (source: MapPinSource) => void;
  trafficSubsWithData: MapPinTrafficType[];
  trafficTypeCounts: Map<string, number>;
  activeTrafficTypes: Set<MapPinTrafficType>;
  trafficIsActive: boolean;
  trafficIsPartial: boolean;
  onToggleTrafficType: (type: MapPinTrafficType) => void;
}

export function FilterRow({
  source,
  isActive,
  count,
  tier,
  onToggle,
  onLockedRowTap,
  trafficSubsWithData,
  trafficTypeCounts,
  activeTrafficTypes,
  trafficIsActive,
  trafficIsPartial,
  onToggleTrafficType,
}: FilterRowProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  const style = MAP_PIN_STYLES[source];
  const isTraffic = source === 'traffic';
  const requiredTier = SOURCE_REQUIRED_TIER[source];
  const isLocked = TIER_ORDER[tier] < TIER_ORDER[requiredTier];

  const dividerColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(14,34,63,0.08)';
  const countColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(14,34,63,0.45)';

  const RowContainer = isLocked ? Pressable : View;
  const rowProps = isLocked ? { onPress: () => onLockedRowTap?.(source) } : {};

  return (
    <View>
      {isTraffic && <View style={[styles.divider, { backgroundColor: dividerColor }]} />}

      <RowContainer {...rowProps} style={[styles.row, isLocked && styles.rowLocked]}>
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
        {isLocked ? (
          <View style={styles.lockedTrailing}>
            <IconLock size={14} color={countColor} />
            <TierBadge tier={requiredTier as 'PLUS' | 'PRO'} size="sm" />
          </View>
        ) : (
          <>
            <Text style={[styles.count, { color: countColor }]}>{count}</Text>
            <MapToggle
              on={isActive}
              onToggle={() => onToggle(source)}
              partial={isTraffic && trafficIsPartial}
              isDark={isDark}
            />
          </>
        )}
      </RowContainer>

      {!isLocked && isTraffic && trafficIsActive && trafficSubsWithData.length > 0 && (
        <View>
          {trafficSubsWithData.map((type) => {
            const subCount = trafficTypeCounts.get(type) ?? 0;
            const subActive = activeTrafficTypes.has(type);
            const SubIcon = getIconByName(TRAFFIC_ICON_MAP[type] ?? 'IconInfoCircle');
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
}

const styles = StyleSheet.create({
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
  rowLocked: {
    opacity: 0.7,
  },
  lockedTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
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
});
