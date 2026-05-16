import { IconMapPin } from '@tabler/icons-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import type { DigestMode } from '@notifio/api-client';
import { useNameday, useWeather } from '@notifio/shared/hooks';

import { AlertsPreview } from '../../components/dashboard/alerts-preview';
import { DigestBanner } from '../../components/dashboard/digest-banner';
import { AdPlaceholder } from '../../components/monetization/ad-placeholder';
import { UpsellCard } from '../../components/monetization/upsell-card';
import { ScreenLayout } from '../../components/ui/screen-layout';
import { NamedayCard } from '../../components/weather/nameday-card';
import { WeatherCard } from '../../components/weather/weather-card';
import { WeatherWarningsBanner } from '../../components/weather/weather-warnings-banner';
import { useEventsFeed } from '../../hooks/use-events-feed';
import { useLocations } from '../../hooks/use-locations';
import { useProfile } from '../../hooks/use-profile';
import { useResolvedLocation } from '../../hooks/use-resolved-location';
import { useWeatherWarnings } from '../../hooks/use-weather-warnings';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

const ORANGE = '#FF7A2F';

export default function OverviewScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const { location } = useResolvedLocation();
  const { locations } = useLocations();
  const { profile } = useProfile();

  // useWeather from shared currently ignores location args (locked to
  // DEFAULT_LOCATION). Tracked as a follow-up; warnings/events/nameday
  // honor the resolved location. AQI + pollen moved to /weather page
  // — not consumed on dashboard.
  const { weather, isLoading: weatherLoading, error, refresh } = useWeather();
  const { todayNames, upcomingNames, isLoading: namedayLoading } = useNameday(location);
  const { warnings } = useWeatherWarnings(location);
  const { events } = useEventsFeed(location);

  const digestMode = (profile as unknown as { digestMode?: DigestMode } | null)?.digestMode;

  const baseLabel = location.label ?? t('overview.currentLocation');
  const locationLabel =
    location.source === 'gps' ? `${baseLabel} (GPS)` : baseLabel;
  const savedCount = locations.length;

  return (
    <ScreenLayout scrollable>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('screens.overview.title')}
        </Text>
        <View style={styles.subRow}>
          <IconMapPin size={11} color={ORANGE} />
          <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
            {locationLabel}
            {savedCount > 0
              ? ` · ${savedCount} ${t('overview.savedShort')}`
              : ''}
          </Text>
        </View>
      </View>

      <View style={styles.stack}>
        {warnings.length > 0 && <WeatherWarningsBanner warnings={warnings} />}

        <WeatherCard
          weather={weather}
          isLoading={weatherLoading}
          error={error}
          locationLabel={locationLabel}
          onRetry={refresh}
        />

        {digestMode && <DigestBanner digestMode={digestMode} />}

        <AlertsPreview events={events} />

        <NamedayCard
          todayNames={todayNames}
          upcomingNames={upcomingNames}
          isLoading={namedayLoading}
        />

        <UpsellCard />
        <AdPlaceholder variant="banner" />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 18,
    ...theme.font.medium,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  subtitle: { fontSize: 11, flex: 1 },
  stack: { gap: theme.spacing.md },
});
