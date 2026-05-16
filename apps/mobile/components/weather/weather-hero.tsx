import { IconMapPin } from '@tabler/icons-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { WEATHER_HERO_COLORS } from '@notifio/shared';
import type { WeatherData } from '@notifio/shared/types';
import { getWeatherStyle } from '@notifio/shared/weather';

import { theme } from '../../lib/theme';

interface Props {
  weather: WeatherData | null;
  locationLabel: string;
  isLoading: boolean;
}

export function WeatherHero({ weather, locationLabel, isLoading }: Props) {
  const { t } = useTranslation();

  if (isLoading || !weather) {
    return <View style={[styles.skeleton, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />;
  }

  const bg = WEATHER_HERO_COLORS[weather.condition] ?? WEATHER_HERO_COLORS.unknown;
  const style = getWeatherStyle(weather.condition);
  const conditionLabel = t(`weatherConditions.${weather.condition}`, {
    defaultValue: style.label,
  });

  return (
    <View style={[styles.hero, { backgroundColor: bg }]}>
      <View style={styles.locationRow}>
        <IconMapPin size={14} color="#FFFFFF" />
        <Text style={styles.locationText}>{locationLabel}</Text>
      </View>
      <Text style={styles.condition}>{conditionLabel}</Text>
      <Text style={styles.temp}>{Math.round(weather.temperature)}°</Text>
      <Text style={styles.feelsLike}>
        {t('weather.feelsLike')} {Math.round(weather.feelsLike)}°
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
  },
  skeleton: {
    height: 220,
    borderRadius: theme.radius.xl,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.sm,
    opacity: 0.9,
  },
  condition: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.sm,
    opacity: 0.8,
    marginTop: theme.spacing.xs,
  },
  temp: {
    color: '#FFFFFF',
    fontSize: 72,
    ...theme.font.bold,
    marginTop: theme.spacing.md,
  },
  feelsLike: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.sm,
    opacity: 0.85,
    marginTop: theme.spacing.xs,
  },
});
