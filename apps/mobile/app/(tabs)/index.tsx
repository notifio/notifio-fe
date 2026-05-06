import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { DEFAULT_LOCATION } from '@notifio/shared/geo';
import { useAirQuality, useNameday, usePollen, useWeather } from '@notifio/shared/hooks';

import { AdPlaceholder } from '../../components/monetization/ad-placeholder';
import { UpsellCard } from '../../components/monetization/upsell-card';
import { ScreenHeader } from '../../components/ui/screen-header';
import { ScreenLayout } from '../../components/ui/screen-layout';
import { NamedayCard } from '../../components/weather/nameday-card';
import { WeatherCard } from '../../components/weather/weather-card';
import { theme } from '../../lib/theme';

export default function OverviewScreen() {
  const { t } = useTranslation();
  const { weather, isLoading, error, refresh } = useWeather();
  const { airQuality, isLoading: aqiIsLoading } = useAirQuality();
  const { pollen } = usePollen(DEFAULT_LOCATION);
  const { todayNames, upcomingNames, isLoading: namedayLoading } = useNameday(DEFAULT_LOCATION);

  return (
    <ScreenLayout scrollable header={<ScreenHeader title={t('screens.overview.title')} subtitle={DEFAULT_LOCATION.label} />}>
      <View style={styles.content}>
        <WeatherCard weather={weather} isLoading={isLoading} error={error} locationLabel={DEFAULT_LOCATION.label} onRetry={refresh} airQuality={airQuality} aqiLoading={aqiIsLoading} pollen={pollen} />
        <NamedayCard todayNames={todayNames} upcomingNames={upcomingNames} isLoading={namedayLoading} />
        <UpsellCard />
        <AdPlaceholder variant="banner" />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.md,
  },
});
