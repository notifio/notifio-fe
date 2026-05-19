import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useAirQuality, usePollen, useWeather } from '@notifio/shared/hooks';

import { ScreenLayout } from '../../components/ui/screen-layout';
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

  const coords = { lat: location.lat, lng: location.lng };
  const { weather, isLoading: weatherLoading, error, refresh } = useWeather(coords);
  const { airQuality } = useAirQuality(coords);
  const { pollen } = usePollen(location);
  const { forecast } = useForecast(location);
  const { config: radarConfig } = useRadarConfig();

  const locationLabel = location.label ?? '';

  if (error && !weather) {
    return (
      <ScreenLayout>
        <View style={[styles.errorBox, { borderColor: colors.severity?.critical.border ?? '#FF3B30' }]}>
          <Text style={[styles.errorTitle, { color: colors.severity?.critical.text ?? '#FF3B30' }]}>
            {t('weatherPage.error.title')}
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout scrollable>
      <View style={styles.hero}>
        {/* Same WeatherCard as the dashboard but simplified — only
            location + condition + temp + feels-like + icon. AQI and
            pollen render as separate cards below. */}
        <WeatherCard
          weather={weather}
          isLoading={weatherLoading}
          error={error}
          locationLabel={locationLabel}
          onRetry={refresh}
          variant="simplified"
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
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
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
