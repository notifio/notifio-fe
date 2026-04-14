'use client';

import { IconClock, IconPlus } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { AdPlaceholder } from '@/components/app/ad-placeholder';
import { AlertList } from '@/components/app/alert-list';
import { DashboardMap } from '@/components/app/dashboard-map';
import { EventReportModal } from '@/components/app/event-report-modal';
import { MapFilterBar } from '@/components/app/map-filter-bar';
import { NamedayCard } from '@/components/app/nameday-card';
import { WeatherCard } from '@/components/app/weather-card';
import { WeatherWarningsBanner } from '@/components/app/weather-warnings-banner';
import { useAirQuality } from '@/hooks/use-air-quality';
import { useDigestMode } from '@/hooks/use-digest-mode';
import { useMapData } from '@/hooks/use-map-data';
import { useNameday } from '@/hooks/use-nameday';
import { usePollen } from '@/hooks/use-pollen';
import { useUserLocation } from '@/hooks/use-user-location';
import { useWeather } from '@/hooks/use-weather';
import { useWeatherWarnings } from '@/hooks/use-weather-warnings';
import { api } from '@/lib/api';
import { DEFAULT_LOCATION } from '@/lib/location';
import { MAP_FILTER_SOURCES } from '@/lib/map-pin-config';
import type { MapPinSource, TrafficIncidentType } from '@/lib/normalize-pins';

const ALL_TRAFFIC_TYPES: TrafficIncidentType[] = [
  'accident',
  'congestion',
  'construction',
  'event',
  'flooding',
  'road_closure',
  'weather',
  'other',
];

const MAPPABLE_CATEGORIES = new Set([
  'outage_electric',
  'outage-electricity',
  'outage_water',
  'outage-water',
  'outage_gas',
  'outage-gas',
  'outage_heat',
  'outage-heat',
  'traffic',
]);

interface FlyToTarget {
  lat: number;
  lng: number;
  zoom: number;
}

interface InfoOverlay {
  title: string;
  category: string;
  description: string;
}

export default function DashboardPage() {
  const t = useTranslations('map');
  const td = useTranslations('digest');
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [flyTo, setFlyTo] = useState<FlyToTarget | null>(null);
  const [infoOverlay, setInfoOverlay] = useState<InfoOverlay | null>(null);
  const [eventLoading, setEventLoading] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<MapPinSource>>(
    () => new Set(MAP_FILTER_SOURCES),
  );
  const [activeTrafficTypes, setActiveTrafficTypes] = useState<Set<TrafficIncidentType>>(
    () => new Set(ALL_TRAFFIC_TYPES),
  );
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const { location: userLocation, isGps } = useUserLocation();
  const { weather, isLoading, error, refresh } = useWeather();
  const { airQuality, isLoading: aqiIsLoading } = useAirQuality();
  const { warnings } = useWeatherWarnings(userLocation ?? DEFAULT_LOCATION);
  const { name: namedayName, loading: namedayLoading } = useNameday(userLocation ?? DEFAULT_LOCATION);
  const { pollen: pollenData } = usePollen(userLocation ?? DEFAULT_LOCATION);
  const { digestMode } = useDigestMode();

  const effectiveCenter = mapCenter ?? userLocation ?? DEFAULT_LOCATION;
  const { pins, flowSegments, isLoading: mapLoading, error: mapError, refresh: mapRefresh } = useMapData(effectiveCenter);

  // Fetch event detail when a notification is selected
  useEffect(() => {
    if (!selectedAlertId) {
      setFlyTo(null);
      setInfoOverlay(null);
      setEventError(null);
      return;
    }

    let cancelled = false;
    setEventLoading(true);
    setEventError(null);

    api.getEventDetail(selectedAlertId)
      .then((event) => {
        if (cancelled) return;
        const isMappable = MAPPABLE_CATEGORIES.has(event.category.code);
        if (isMappable && event.location?.lat && event.location?.lng) {
          const pinExists = pins.some(
            (p) =>
              Math.abs(p.lat - event.location.lat) < 0.001 &&
              Math.abs(p.lng - event.location.lng) < 0.001
          );
          if (pinExists) {
            setFlyTo({ lat: event.location.lat, lng: event.location.lng, zoom: 15 });
            setInfoOverlay(null);
          } else {
            setFlyTo(null);
            setInfoOverlay({
              title: event.type.name,
              category: event.category.name,
              description: t('eventUnavailable'),
            });
          }
        } else {
          setFlyTo(null);
          setInfoOverlay({
            title: event.type.name,
            category: event.category.name,
            description: t('coversYourArea'),
          });
        }
      })
      .catch(() => {
        if (cancelled) return;
        setEventError(t('eventUnavailable'));
        setSelectedAlertId(null);
      })
      .finally(() => {
        if (!cancelled) setEventLoading(false);
      });

    return () => { cancelled = true; };
  }, [selectedAlertId, pins, t]);

  // Clear error after 3 seconds
  useEffect(() => {
    if (!eventError) return;
    const timer = setTimeout(() => setEventError(null), 3000);
    return () => clearTimeout(timer);
  }, [eventError]);

  // Auto-dismiss info overlay after 5 seconds
  useEffect(() => {
    if (!infoOverlay) return;
    const timer = setTimeout(() => {
      setInfoOverlay(null);
      setSelectedAlertId(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [infoOverlay]);

  const handleAlertSelect = useCallback((eventId: string) => {
    setSelectedAlertId((prev) => (prev === eventId ? null : eventId));
  }, []);

  const handleCloseOverlay = useCallback(() => {
    setInfoOverlay(null);
    setSelectedAlertId(null);
  }, []);

  const handleFlyToComplete = useCallback(() => {
    setFlyTo(null);
  }, []);

  const toggleFilter = useCallback((source: MapPinSource) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(source)) {
        next.delete(source);
        if (source === 'traffic') {
          setActiveTrafficTypes(new Set());
        }
      } else {
        next.add(source);
        if (source === 'traffic') {
          setActiveTrafficTypes(new Set(ALL_TRAFFIC_TYPES));
        }
      }
      return next;
    });
  }, []);

  const toggleTrafficType = useCallback((type: TrafficIncidentType) => {
    setActiveTrafficTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      if (next.size === 0) {
        setActiveFilters((f) => {
          const nf = new Set(f);
          nf.delete('traffic');
          return nf;
        });
      }
      return next;
    });
  }, []);

  return (
    <div className="flex h-[calc(100vh-3.5rem-4rem)] flex-col md:h-[calc(100vh-3.5rem)] lg:flex-row">
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
          onSelect={handleAlertSelect}
          isLoadingEvent={eventLoading}
        />

        <div className="px-4 pb-4">
          <AdPlaceholder variant="banner" />
        </div>
      </div>
      <div className="relative hidden min-h-0 flex-1 p-4 md:block">
        <MapFilterBar
          activeFilters={activeFilters}
          activeTrafficTypes={activeTrafficTypes}
          onToggle={toggleFilter}
          onToggleTrafficType={toggleTrafficType}
          pins={pins}
        />
        <DashboardMap
          pins={pins}
          activeFilters={activeFilters}
          activeTrafficTypes={activeTrafficTypes}
          flowSegments={flowSegments}
          isLoading={mapLoading}
          error={mapError}
          onRetry={mapRefresh}
          center={userLocation}
          isGpsCenter={isGps}
          onCenterChange={setMapCenter}
          flyTo={flyTo}
          onFlyToComplete={handleFlyToComplete}
          infoOverlay={infoOverlay}
          onCloseOverlay={handleCloseOverlay}
        />

        {/* Report event FAB — positioned above map attribution */}
        <button
          onClick={() => setReportOpen(true)}
          className="absolute bottom-16 right-16 z-20 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <IconPlus size={26} />
        </button>

        {reportOpen && (
          <EventReportModal
            lat={effectiveCenter.lat}
            lng={effectiveCenter.lng}
            onClose={() => {
              setReportOpen(false);
              mapRefresh();
            }}
          />
        )}
      </div>
    </div>
  );
}
