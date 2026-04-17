import { IconChevronDown, IconChevronUp } from '@tabler/icons-react-native';
import { useState } from 'react';
import { LayoutAnimation, Pressable, StyleSheet, Text, View } from 'react-native';

import { AQ_COMPONENT_INFO, getAqiStyle } from '@notifio/shared/air-quality';
import type { AirQualityData } from '@notifio/shared/types';

import { theme } from '../../lib/theme';

function withOpacity(hexColor: string, opacity: number): string {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hexColor}${alpha}`;
}

interface AqiIndicatorProps {
  airQuality: AirQualityData | null;
  isLoading: boolean;
  textColor: string;
}

export function AqiIndicator({ airQuality, isLoading, textColor }: AqiIndicatorProps) {
  const [expanded, setExpanded] = useState(false);

  if (isLoading) {
    return <View style={[styles.skeleton, { backgroundColor: withOpacity(textColor, 0.1) }]} />;
  }

  if (!airQuality) return null;

  const aqiStyle = getAqiStyle(airQuality.level);
  const Chevron = expanded ? IconChevronUp : IconChevronDown;
  const muted70 = withOpacity(textColor, 0.7);
  const muted50 = withOpacity(textColor, 0.5);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  return (
    <View>
      <Pressable onPress={toggle} style={[styles.row, { backgroundColor: withOpacity(textColor, 0.1) }]}>
        <View style={[styles.dot, { backgroundColor: aqiStyle.color }]} />
        <Text style={[styles.aqiLabel, { color: textColor }]}>AQI {airQuality.aqi}</Text>
        <Text style={[styles.levelLabel, { color: muted70 }]}>{aqiStyle.label}</Text>
        <View style={styles.chevron}>
          <Chevron size={16} color={muted70} />
        </View>
      </Pressable>

      {expanded && (
        <View style={styles.details}>
          <View style={styles.grid}>
            {Object.entries(airQuality.components).map(([key, value]) => {
              const info = AQ_COMPONENT_INFO[key];
              if (!info) return null;
              return (
                <View key={key} style={styles.gridItem}>
                  <Text style={[styles.componentLabel, { color: muted50 }]}>{info.label}</Text>
                  <Text style={[styles.componentValue, { color: muted70 }]}>
                    {(value as number).toFixed(1)}{' '}
                    <Text style={styles.componentUnit}>{info.unit}</Text>
                  </Text>
                </View>
              );
            })}
          </View>
          <Text style={[styles.description, { color: muted50 }]}>{aqiStyle.description}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    height: 36,
    borderRadius: theme.radius.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: theme.radius.full,
  },
  aqiLabel: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  levelLabel: {
    fontSize: theme.fontSize.sm,
  },
  chevron: {
    marginLeft: 'auto',
  },
  details: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
    paddingRight: theme.spacing.md,
  },
  componentLabel: {
    fontSize: theme.fontSize.xs,
  },
  componentValue: {
    fontSize: theme.fontSize.xs,
    ...theme.font.medium,
  },
  componentUnit: {
    fontSize: theme.fontSize.xs,
    ...theme.font.regular,
  },
  description: {
    fontSize: theme.fontSize.xs,
    fontStyle: 'italic',
    marginTop: theme.spacing.sm,
  },
});
