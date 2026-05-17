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

const COMPONENT_LABEL: Record<string, string> = {
  pm2_5: 'PM2.5',
  pm10: 'PM10',
  o3: 'O3',
  no2: 'NO2',
  no: 'NO',
  so2: 'SO2',
  co: 'CO',
  nh3: 'NH3',
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

  const componentEntries = Object.entries(aqi.components ?? {}).filter(
    ([, value]) => typeof value === 'number',
  );

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
            style={[styles.segment, { backgroundColor: seg <= aqi.aqi ? color : colors.border }]}
          />
        ))}
      </View>
      <Text style={[styles.recommendation, { color: colors.textSecondary }]}>
        {t(`airQuality.recommendation.${levelKey}`)}
      </Text>

      {componentEntries.length > 0 && (
        <View style={[styles.componentsBlock, { borderTopColor: colors.border }]}>
          <View style={styles.grid}>
            {componentEntries.map(([key, value]) => (
              <View key={key} style={styles.cell}>
                <Text style={[styles.cellLabel, { color: colors.textMuted }]}>
                  {COMPONENT_LABEL[key] ?? key.toUpperCase()}
                </Text>
                <Text style={[styles.cellValue, { color: colors.text }]}>
                  {(value as number).toFixed(1)}
                </Text>
              </View>
            ))}
          </View>
          <Text style={[styles.unit, { color: colors.textMuted }]}>μg/m³</Text>
        </View>
      )}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: theme.fontSize.md, ...theme.font.semibold },
  level: { fontSize: theme.fontSize.sm, ...theme.font.semibold },
  bar: { flexDirection: 'row', gap: 4, paddingVertical: theme.spacing.xs },
  segment: { flex: 1, height: 6, borderRadius: 3 },
  recommendation: { fontSize: theme.fontSize.xs, lineHeight: 18 },
  componentsBlock: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: '33.33%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingRight: theme.spacing.sm,
  },
  cellLabel: { fontSize: theme.fontSize.xs },
  cellValue: { fontSize: theme.fontSize.xs, ...theme.font.semibold },
  unit: { fontSize: 10, textAlign: 'right', marginTop: 4 },
});
