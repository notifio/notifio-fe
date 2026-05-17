import {
  IconCloud,
  IconCloudFog,
  IconCloudRain,
  IconCloudStorm,
  IconSnowflake,
  IconSun,
  IconTemperature,
  type Icon,
} from '@tabler/icons-react-native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { ForecastHourly } from '@notifio/api-client';
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
  hourly: ForecastHourly[];
}

export function HourlyForecast({ hourly }: Props) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();

  const fromNow = useMemo(() => {
    const cutoff = Date.now() - 30 * 60_000;
    return hourly.filter((h) => new Date(h.timestamp).getTime() >= cutoff);
  }, [hourly]);

  if (fromNow.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('forecast.hourly.section')}
        </Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>{fromNow.length} h</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {fromNow.map((h, i) => {
          const Icon = iconFor(h.condition);
          const label =
            i === 0
              ? t('forecast.now')
              : new Date(h.timestamp).toLocaleTimeString(i18n.language, {
                  hour: 'numeric',
                  hour12: false,
                });
          return (
            <View key={h.timestamp} style={styles.tile}>
              <Text style={[styles.tileTime, { color: colors.textMuted }]}>{label}</Text>
              <Icon size={22} color={colors.text} strokeWidth={1.8} />
              <Text style={[styles.tileTemp, { color: colors.text }]}>
                {Math.round(h.temperatureC)}°
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
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  title: { fontSize: theme.fontSize.md, ...theme.font.semibold },
  meta: { fontSize: theme.fontSize.sm },
  row: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  tile: {
    alignItems: 'center',
    minWidth: 48,
    gap: theme.spacing.xs,
  },
  tileTime: { fontSize: theme.fontSize.xs },
  tileTemp: { fontSize: theme.fontSize.sm, ...theme.font.semibold },
});
