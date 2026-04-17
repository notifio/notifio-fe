import { IconCar } from '@tabler/icons-react-native';
import { StyleSheet, View } from 'react-native';

import { PlaceholderCard } from '../../components/ui/placeholder-card';
import { ScreenHeader } from '../../components/ui/screen-header';
import { ScreenLayout } from '../../components/ui/screen-layout';
import { WeatherCard } from '../../components/weather/weather-card';
import { useAirQuality } from '../../hooks/use-air-quality';
import { usePollen } from '../../hooks/use-pollen';
import { useWeather } from '../../hooks/use-weather';
import { DEFAULT_LOCATION } from '../../lib/location';
import { theme } from '../../lib/theme';

export default function OverviewScreen() {
  const { weather, isLoading, error, refresh } = useWeather();
  const { airQuality, isLoading: aqiIsLoading } = useAirQuality();
  const { pollen } = usePollen();

  return (
    <ScreenLayout scrollable header={<ScreenHeader title="Overview" subtitle={DEFAULT_LOCATION.label} />}>
      <View style={styles.content}>
        <WeatherCard weather={weather} isLoading={isLoading} error={error} locationLabel={DEFAULT_LOCATION.label} onRetry={refresh} airQuality={airQuality} aqiLoading={aqiIsLoading} pollen={pollen} />
        <PlaceholderCard icon={IconCar} title="Traffic Summary" subtitle="Coming soon" />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.md,
  },
});
