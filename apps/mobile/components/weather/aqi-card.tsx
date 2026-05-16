import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import type { AirQualityData } from '@notifio/shared/types';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

const AQI_LEVEL_KEY: Record<AirQualityData['level'], 'good' | 'fair' | 'moderate' | 'poor' | 'veryPoor'> = {
  good: 'good',
  fair: 'fair',
  moderate: 'moderate',
  poor: 'poor',
  very_poor: 'veryPoor',
};

const AQI_COLOR: Record<string, string> = {
  good: '#22C55E',
  fair: '#84CC16',
  moderate: '#EAB308',
  poor: '#F97316',
  veryPoor: '#EF4444',
};

interface Props {
  aqi: AirQualityData | null;
}

export function AqiCard({ aqi }: Props) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  if (!aqi) {
    return <View style={[styles.skeleton, { backgroundColor: colors.surface }]} />;
  }

  const levelKey = AQI_LEVEL_KEY[aqi.level];
  const color = AQI_COLOR[levelKey] ?? AQI_COLOR.moderate;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('airQuality.title')}</Text>
        <Text style={[styles.level, { color }]}>{t(`airQuality.${levelKey}`)}</Text>
      </View>
      <View style={styles.bar}>
        {[1, 2, 3, 4, 5].map((seg) => (
          <View
            key={seg}
            style={[
              styles.segment,
              { backgroundColor: seg <= aqi.aqi ? color : colors.border },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.recommendation, { color: colors.textSecondary }]}>
        {t(`airQuality.recommendation.${levelKey}`)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  skeleton: { height: 120, borderRadius: theme.radius.xl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: theme.fontSize.md, ...theme.font.semibold },
  level: { fontSize: theme.fontSize.sm, ...theme.font.semibold },
  bar: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: theme.spacing.xs,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  recommendation: {
    fontSize: theme.fontSize.xs,
    lineHeight: 18,
  },
});
