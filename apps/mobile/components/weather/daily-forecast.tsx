import {
  IconCloud,
  IconCloudFog,
  IconCloudRain,
  IconCloudStorm,
  IconDroplet,
  IconSnowflake,
  IconSun,
  IconTemperature,
  type Icon,
} from '@tabler/icons-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import type { ForecastDaily } from '@notifio/api-client';
import { getWeatherStyle } from '@notifio/shared/weather';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

const ICON_MAP: Record<string, Icon> = {
  Sun: IconSun,
  Cloud: IconCloud,
  CloudRain: IconCloudRain,
  CloudDrizzle: IconCloudRain,
  CloudLightning: IconCloudStorm,
  Snowflake: IconSnowflake,
  CloudFog: IconCloudFog,
  Haze: IconCloudFog,
  Thermometer: IconTemperature,
};

function iconFor(condition: string): Icon {
  const style = getWeatherStyle(condition);
  return ICON_MAP[style.iconName] ?? IconTemperature;
}

interface Props {
  daily: ForecastDaily[];
}

export function DailyForecast({ daily }: Props) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();

  if (daily.length === 0) return null;

  const labelForDay = (date: string, index: number) => {
    if (index === 0) return t('forecast.today');
    if (index === 1) return t('forecast.tomorrow');
    if (index === 2) return t('forecast.dayAfter');
    return new Intl.DateTimeFormat(i18n.language, { weekday: 'short' }).format(new Date(date));
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('forecast.daily.section')}
        </Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {daily.length} {t('forecast.days')}
        </Text>
      </View>
      {daily.map((d, i) => {
        const Icon = iconFor(d.condition);
        return (
          <View
            key={d.date}
            style={[
              styles.row,
              i < daily.length - 1 && {
                borderBottomColor: colors.border,
                borderBottomWidth: StyleSheet.hairlineWidth,
              },
            ]}
          >
            <Text style={[styles.day, { color: colors.text }]}>{labelForDay(d.date, i)}</Text>
            <Icon size={20} color={colors.text} strokeWidth={1.8} />
            <View style={styles.precip}>
              <IconDroplet size={12} color={colors.textMuted} />
              <Text style={[styles.precipText, { color: colors.textMuted }]}>
                {d.precipitationProbabilityPct}%
              </Text>
            </View>
            <Text style={[styles.temps, { color: colors.text }]}>
              {Math.round(d.minC)}° <Text style={{ color: colors.textMuted }}>·</Text>{' '}
              {Math.round(d.maxC)}°
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: theme.radius.xl, borderWidth: 1, paddingVertical: theme.spacing.sm },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  title: { fontSize: theme.fontSize.md, ...theme.font.semibold },
  meta: { fontSize: theme.fontSize.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  day: { flex: 1, fontSize: theme.fontSize.sm, ...theme.font.medium },
  precip: { flexDirection: 'row', alignItems: 'center', gap: 2, width: 48 },
  precipText: { fontSize: theme.fontSize.xs },
  temps: { fontSize: theme.fontSize.sm, ...theme.font.semibold, minWidth: 80, textAlign: 'right' },
});
