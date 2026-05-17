import {
  IconDroplet,
  IconEye,
  IconGauge,
  IconWind,
  type Icon,
} from '@tabler/icons-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import type { WeatherData } from '@notifio/shared/types';
import { formatVisibility, formatWind } from '@notifio/shared/weather';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

interface Props {
  weather: WeatherData;
}

interface Cell {
  Icon: Icon;
  label: string;
  value: string;
}

export function OtherStatsGrid({ weather }: Props) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const cells: Cell[] = [
    { Icon: IconWind, label: t('weather.wind'), value: formatWind(weather.windSpeed, weather.windDirection) },
    { Icon: IconDroplet, label: t('weather.humidity'), value: `${weather.humidity}%` },
    { Icon: IconEye, label: t('weather.visibility'), value: formatVisibility(weather.visibility) },
    { Icon: IconGauge, label: t('weather.pressure'), value: `${weather.pressure} hPa` },
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t('weatherPage.otherStats')}</Text>
      <View style={styles.grid}>
        {cells.map((c) => (
          <View key={c.label} style={styles.cell}>
            <c.Icon size={18} color={colors.textMuted} />
            <View style={styles.cellBody}>
              <Text style={[styles.cellLabel, { color: colors.textMuted }]}>{c.label}</Text>
              <Text style={[styles.cellValue, { color: colors.text }]}>{c.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  title: { fontSize: theme.fontSize.md, ...theme.font.semibold },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  cellBody: { flex: 1 },
  cellLabel: { fontSize: theme.fontSize.xs },
  cellValue: { fontSize: theme.fontSize.sm, ...theme.font.semibold },
});
