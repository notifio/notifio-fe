import {
  IconCloud,
  IconCloudFog,
  IconCloudRain,
  IconCloudStorm,
  IconMist,
  IconMoon,
  IconSnowflake,
  IconSun,
  IconTemperature,
  type Icon,
} from '@tabler/icons-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { ForecastHourly } from '@notifio/api-client';
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

interface HourlyForecastProps {
  hourly: ForecastHourly[];
}

export function HourlyForecast({ hourly }: HourlyForecastProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();

  if (hourly.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('forecast.hourly.section', { defaultValue: 'Hourly forecast' })}
        </Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {hourly.length} h
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {hourly.map((h, i) => {
          const Icon = iconFor(h.condition);
          const date = new Date(h.timestamp);
          const label =
            i === 0
              ? t('forecast.now', { defaultValue: 'Now' })
              : date.toLocaleTimeString(i18n.language, {
                  hour: '2-digit',
                  minute: undefined,
                });
          return (
            <View key={h.timestamp} style={styles.tile}>
              <Text style={[styles.tileTime, { color: colors.textMuted }]}>{label}</Text>
              <Icon size={22} color={colors.text} strokeWidth={1.8} />
              <Text style={[styles.tileTemp, { color: colors.text }]}>
                {formatTemp(h.temperatureC)}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    paddingVertical: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
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
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  tile: {
    alignItems: 'center',
    minWidth: 44,
    gap: theme.spacing.xs,
  },
  tileTime: {
    fontSize: theme.fontSize.xs,
  },
  tileTemp: {
    fontSize: theme.fontSize.sm,
    ...theme.font.semibold,
  },
});
