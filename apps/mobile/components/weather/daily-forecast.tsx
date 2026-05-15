import {
  IconCloud,
  IconCloudFog,
  IconCloudRain,
  IconCloudStorm,
  IconDroplet,
  IconMist,
  IconMoon,
  IconSnowflake,
  IconSun,
  IconTemperature,
  type Icon,
} from '@tabler/icons-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import type { ForecastDaily } from '@notifio/api-client';
import { formatTemp, getWeatherStyle } from '@notifio/shared/weather';

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
  Haze: IconMist,
  Thermometer: IconTemperature,
  Moon: IconMoon,
};

function iconFor(condition: string): Icon {
  const style = getWeatherStyle(condition);
  return ICON_MAP[style.iconName] ?? IconTemperature;
}

function dayLabel(dateStr: string, locale: string, t: (k: string, opts?: { defaultValue?: string }) => string, index: number): string {
  if (index === 0) return t('forecast.today', { defaultValue: 'Today' });
  if (index === 1) return t('forecast.tomorrow', { defaultValue: 'Tomorrow' });
  return new Date(dateStr).toLocaleDateString(locale, { weekday: 'short' });
}

interface DailyForecastProps {
  daily: ForecastDaily[];
}

export function DailyForecast({ daily }: DailyForecastProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();

  if (daily.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('forecast.daily.section', { defaultValue: 'Daily forecast' })}
        </Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>{daily.length} {t('forecast.days', { defaultValue: 'days' })}</Text>
      </View>

      {daily.map((d, i) => {
        const Icon = iconFor(d.condition);
        return (
          <View
            key={d.date}
            style={[
              styles.row,
              i < daily.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
            ]}
          >
            <Text style={[styles.day, { color: colors.text }]}>
              {dayLabel(d.date, i18n.language, t, i)}
            </Text>
            <View style={styles.iconCol}>
              <Icon size={20} color={colors.text} strokeWidth={1.8} />
            </View>
            <View style={styles.precip}>
              <IconDroplet size={12} color={colors.textMuted} />
              <Text style={[styles.precipText, { color: colors.textMuted }]}>
                {d.precipitationProbabilityPct}%
              </Text>
            </View>
            <Text style={[styles.temps, { color: colors.text }]}>
              {formatTemp(d.minC)} <Text style={{ color: colors.textMuted }}>·</Text> {formatTemp(d.maxC)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    paddingVertical: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.md,
    ...theme.font.medium,
  },
  meta: {
    fontSize: theme.fontSize.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  day: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  iconCol: {
    width: 24,
    alignItems: 'center',
  },
  precip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    width: 48,
  },
  precipText: {
    fontSize: theme.fontSize.xs,
  },
  temps: {
    fontSize: theme.fontSize.sm,
    ...theme.font.semibold,
    minWidth: 80,
    textAlign: 'right',
  },
});
