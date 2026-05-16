import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAirQuality, usePollen, useWeather } from '@notifio/shared/hooks';

import { AqiCard } from '../../components/weather/aqi-card';
import { DailyForecast } from '../../components/weather/daily-forecast';
import { HourlyForecast } from '../../components/weather/hourly-forecast';
import { OtherStatsGrid } from '../../components/weather/other-stats-grid';
import { PollenCard } from '../../components/weather/pollen-card';
import { RadarMini } from '../../components/weather/radar-mini';
import { SunMoonCard } from '../../components/weather/sun-moon-card';
import { WeatherCard } from '../../components/weather/weather-card';
import { useForecast } from '../../hooks/use-forecast';
import { useRadarConfig } from '../../hooks/use-radar-config';
import { useResolvedLocation } from '../../hooks/use-resolved-location';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

export default function WeatherScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { location } = useResolvedLocation();

  // useWeather + useAirQuality from shared currently lock to
  // DEFAULT_LOCATION. Tracked follow-up. Pollen + forecast honor
  // resolved location.
  const { weather, isLoading: weatherLoading, error, refresh } = useWeather();
  const { airQuality, isLoading: aqiLoading } = useAirQuality();
  const { pollen } = usePollen(location);
  const { forecast } = useForecast(location);
  const { config: radarConfig } = useRadarConfig();

  const locationLabel = location.label ?? '';

  if (error && !weather) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
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
      <View style={styles.hero}>
        {/* Same WeatherCard as the dashboard — one component, one source
            of truth. The Pressable inside routes to /weather; tapping
            while on /weather is a no-op (acceptable). */}
        <WeatherCard
          weather={weather}
          isLoading={weatherLoading}
          error={error}
          locationLabel={locationLabel}
          onRetry={refresh}
          airQuality={airQuality}
          aqiLoading={aqiLoading}
          pollen={pollen}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing['4xl'],
  },
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
