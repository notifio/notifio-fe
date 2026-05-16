import { IconArrowLeft } from '@tabler/icons-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAirQuality, usePollen, useWeather } from '@notifio/shared/hooks';

import { AqiCard } from '../components/weather/aqi-card';
import { DailyForecast } from '../components/weather/daily-forecast';
import { HourlyForecast } from '../components/weather/hourly-forecast';
import { OtherStatsGrid } from '../components/weather/other-stats-grid';
import { PollenCard } from '../components/weather/pollen-card';
import { RadarMini } from '../components/weather/radar-mini';
import { SunMoonCard } from '../components/weather/sun-moon-card';
import { WeatherHero } from '../components/weather/weather-hero';
import { useForecast } from '../hooks/use-forecast';
import { useRadarConfig } from '../hooks/use-radar-config';
import { useResolvedLocation } from '../hooks/use-resolved-location';
import { theme } from '../lib/theme';
import { useAppTheme } from '../providers/theme-provider';

export default function WeatherScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { location } = useResolvedLocation();

  // useWeather + useAirQuality from shared currently lock to
  // DEFAULT_LOCATION. Tracked follow-up. Pollen + forecast honor
  // resolved location.
  const { weather, isLoading: weatherLoading, error } = useWeather();
  const { airQuality } = useAirQuality();
  const { pollen } = usePollen(location);
  const { forecast } = useForecast(location);
  const { config: radarConfig } = useRadarConfig();

  const locationLabel = location.label ?? '';

  if (error && !weather) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <BackButton onPress={() => router.back()} label={t('common.back')} color={colors.text} />
        <View style={[styles.errorBox, { borderColor: colors.severity?.critical.border ?? '#FF3B30' }]}>
          <Text style={[styles.errorTitle, { color: colors.severity?.critical.text ?? '#FF3B30' }]}>
            {t('weatherPage.error.title')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <BackButton onPress={() => router.back()} label={t('common.back')} color={colors.text} />

      <View style={styles.hero}>
        <WeatherHero
          weather={weather}
          locationLabel={locationLabel}
          isLoading={weatherLoading}
        />
      </View>

      <View style={styles.stack}>
        {forecast && <HourlyForecast hourly={forecast.hourly} />}
        {forecast && <DailyForecast daily={forecast.daily} />}
        <AqiCard aqi={airQuality} />
        <PollenCard pollen={pollen} />
        <SunMoonCard sunrise={weather?.sunrise} sunset={weather?.sunset} />
        {weather && <OtherStatsGrid weather={weather} />}
        {radarConfig && <RadarMini config={radarConfig} center={location} />}
      </View>
    </ScrollView>
  );
}

interface BackButtonProps {
  onPress: () => void;
  label: string;
  color: string;
}

function BackButton({ onPress, label, color }: BackButtonProps) {
  return (
    <Pressable onPress={onPress} hitSlop={12} style={styles.backButton}>
      <IconArrowLeft size={18} color={color} />
      <Text style={[styles.backText, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing['4xl'],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: theme.spacing.md,
  },
  backText: { fontSize: theme.fontSize.sm },
  hero: {
    marginBottom: theme.spacing.md,
  },
  stack: {
    gap: theme.spacing.md,
  },
  errorBox: {
    marginTop: theme.spacing.lg,
    borderWidth: 1,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  errorTitle: { fontSize: theme.fontSize.md, ...theme.font.semibold },
});
