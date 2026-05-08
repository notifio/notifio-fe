import {
  IconActivity,
  IconAlertTriangle,
  IconBell,
  IconBolt,
  IconCake,
  IconCar,
  IconChevronDown,
  IconChevronUp,
  IconCloudStorm,
  IconDroplet,
  IconFlame,
  IconFlower,
  IconTemperature,
  IconWifi,
  IconWind,
  type Icon as TablerIconComponent,
} from '@tabler/icons-react-native';
import { useState } from 'react';
import { LayoutAnimation, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import type { NotificationCategoryResponse } from '@notifio/api-client';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

const CATEGORY_ICONS: Record<string, TablerIconComponent> = {
  weather: IconCloudStorm,
  weather_warning: IconAlertTriangle,
  air_quality: IconWind,
  pollen: IconFlower,
  earthquake: IconActivity,
  traffic: IconCar,
  outage_electric: IconBolt,
  outage_water: IconDroplet,
  outage_gas: IconFlame,
  outage_heat: IconTemperature,
  outage_internet: IconWifi,
  wildfire: IconFlame,
  name_day: IconCake,
};

interface NotificationPrefsListProps {
  categories: NotificationCategoryResponse[];
  onToggleItem: (categoryCode: string, subcategoryCode: string | null, enabled: boolean) => void;
  onToggleCategory: (categoryCode: string, enabled: boolean) => void;
  disabled?: boolean;
}

export function NotificationPrefsList({
  categories,
  onToggleItem,
  onToggleCategory,
  disabled,
}: NotificationPrefsListProps) {
  const { colors } = useAppTheme();
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const toggleExpand = (code: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  return (
    <View style={styles.container}>
      {categories.map((category) => {
        const hasChildren = category.items.length > 1;
        const isExpanded = expanded.has(category.categoryCode);
        const someEnabled = category.items.some((i) => i.enabled);
        const Icon = CATEGORY_ICONS[category.categoryCode] ?? IconBell;

        return (
          <View
            key={category.categoryCode}
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Pressable
              onPress={hasChildren ? () => toggleExpand(category.categoryCode) : undefined}
              disabled={!hasChildren}
              style={styles.parentRow}
            >
              <View style={styles.iconWrap}>
                <Icon size={18} color={colors.primary} strokeWidth={2} />
              </View>
              <Text style={[styles.parentTitle, { color: colors.text }]} numberOfLines={1}>
                {category.categoryName}
              </Text>
              {hasChildren && (
                isExpanded ? (
                  <IconChevronUp size={14} color={colors.textMuted} strokeWidth={2} />
                ) : (
                  <IconChevronDown size={14} color={colors.textMuted} strokeWidth={2} />
                )
              )}
              <Switch
                value={someEnabled}
                onValueChange={(v) => onToggleCategory(category.categoryCode, v)}
                disabled={disabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            </Pressable>

            {hasChildren && isExpanded && (
              <View>
                {category.items.map((item) => (
                  <View
                    key={item.preferenceId}
                    style={[styles.subRow, { borderTopColor: colors.border }]}
                  >
                    <Text style={[styles.subTitle, { color: colors.textSecondary }]} numberOfLines={1}>
                      {item.subcategoryName ?? item.subcategoryCode ?? category.categoryName}
                    </Text>
                    <Switch
                      value={item.enabled}
                      onValueChange={(v) => onToggleItem(category.categoryCode, item.subcategoryCode, v)}
                      disabled={disabled}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={colors.background}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  parentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    gap: 11,
  },
  iconWrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  parentTitle: {
    flex: 1,
    fontSize: theme.fontSize.md,
    ...theme.font.medium,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingLeft: 43,
    paddingRight: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  subTitle: {
    flex: 1,
    fontSize: theme.fontSize.sm,
  },
});
