'use client';

import { IconClock } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { AdPlaceholder } from '@/components/app/ad-placeholder';
import { AlertList } from '@/components/app/alert-list';
import { NamedayCard } from '@/components/app/nameday-card';
import { WeatherCard } from '@/components/app/weather-card';
import { WeatherWarningsBanner } from '@/components/app/weather-warnings-banner';
import { useAirQuality } from '@/hooks/use-air-quality';
import { useDigestMode } from '@/hooks/use-digest-mode';
import { useNameday } from '@/hooks/use-nameday';
import { usePollen } from '@/hooks/use-pollen';
import { useWeather } from '@/hooks/use-weather';
import { useWeatherWarnings } from '@/hooks/use-weather-warnings';
import { DEFAULT_LOCATION } from '@/lib/location';

interface LeftPanelProps {
  userLocation: { lat: number; lng: number } | null;
  isGps: boolean;
  selectedAlertId: string | null;
  onAlertSelect: (eventId: string) => void;
  isLoadingEvent: boolean;
  eventError: string | null;
}

export function LeftPanel({
  userLocation,
  isGps,
  selectedAlertId,
  onAlertSelect,
  isLoadingEvent,
  eventError,
}: LeftPanelProps) {
  const t = useTranslations('map');
  const td = useTranslations('digest');
  const { weather, isLoading, error, refresh } = useWeather();
  const { airQuality, isLoading: aqiIsLoading } = useAirQuality();
  const { warnings } = useWeatherWarnings(userLocation ?? DEFAULT_LOCATION);
  const { name: namedayName, loading: namedayLoading } = useNameday(userLocation ?? DEFAULT_LOCATION);
  const { pollen: pollenData } = usePollen(userLocation ?? DEFAULT_LOCATION);
  const { digestMode } = useDigestMode();

  return (
    <div className="scrollbar-hidden h-full w-full shrink-0 overflow-y-auto md:h-1/2 md:border-b md:border-border lg:h-full lg:w-[480px] lg:border-b-0 lg:border-r">
      <div className="p-4">
        <WeatherCard
          weather={weather}
          isLoading={isLoading}
          error={error}
          locationLabel={isGps ? t('yourLocation') : t('defaultLocation')}
          onRetry={refresh}
          airQuality={airQuality}
          aqiLoading={aqiIsLoading}
          pollen={pollenData ? {
            level: pollenData.level,
            dominant: pollenData.dominant ?? '',
            value: pollenData.components[pollenData.dominant as keyof typeof pollenData.components] ?? 0,
            unit: pollenData.unit,
            components: { ...pollenData.components },
          } : null}
        />
        <div className="mt-3">
          <WeatherWarningsBanner warnings={warnings} />
        </div>
        <div className="mt-3">
          <NamedayCard name={namedayName} loading={namedayLoading} />
        </div>

        {digestMode !== 'REAL_TIME' && (
          <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-card px-4 py-2.5">
            <IconClock size={14} className="shrink-0 text-muted" />
            <p className="flex-1 text-xs text-text-secondary">
              {digestMode === 'MORNING' && td("dashboardBanner")}
              {digestMode === 'EVENING' && td("dashboardBannerEvening")}
              {digestMode === 'BOTH' && td("dashboardBannerBoth")}
            </p>
            <a href="/settings" className="shrink-0 text-xs font-medium text-accent hover:underline">
              {td("change")}
            </a>
          </div>
        )}
      </div>

      {/* Event error toast */}
      {eventError && (
        <div className="mx-4 mb-2 rounded-lg bg-danger/10 px-4 py-2 text-xs text-danger">
          {eventError}
        </div>
      )}

      <AlertList
        selectedId={selectedAlertId}
        onSelect={onAlertSelect}
        isLoadingEvent={isLoadingEvent}
      />

      <div className="px-4 pb-4">
        <AdPlaceholder variant="banner" />
      </div>
    </div>
  );
}
