'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { AlertList } from '@/components/app/alert-list';
import { DashboardMap } from '@/components/app/dashboard-map';
import { MapFilterBar } from '@/components/app/map-filter-bar';
import { WeatherCard } from '@/components/app/weather-card';
import { WeatherWarningsBanner } from '@/components/app/weather-warnings-banner';
import { useAirQuality } from '@/hooks/use-air-quality';
import { useMapData } from '@/hooks/use-map-data';
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
  const { location: userLocation, isGps } = useUserLocation();
  const { weather, isLoading, error, refresh } = useWeather();
  const { airQuality, isLoading: aqiIsLoading } = useAirQuality();
  const { warnings } = useWeatherWarnings(userLocation ?? DEFAULT_LOCATION);

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
    <div className="flex h-[calc(100vh-3.5rem)] flex-col lg:flex-row">
      <div className="scrollbar-hidden h-1/2 w-full shrink-0 overflow-y-auto border-b border-border lg:h-full lg:w-[480px] lg:border-b-0 lg:border-r">
        <div className="p-4">
          <WeatherCard
            weather={weather}
            isLoading={isLoading}
            error={error}
            locationLabel={isGps ? t('yourLocation') : t('defaultLocation')}
            onRetry={refresh}
            airQuality={airQuality}
            aqiLoading={aqiIsLoading}
            // TODO: Replace with real pollen endpoint when BE adds GET /api/v1/pollen
            pollen={{ level: 'High', dominant: 'Birch', value: 85, unit: 'gr/m³' }}
          />
          <div className="mt-3">
            <WeatherWarningsBanner warnings={warnings} />
          </div>
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
      </div>
      <div className="relative min-h-0 flex-1 p-4">
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
      </div>
    </div>
  );
}
