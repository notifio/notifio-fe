'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import { AlertList } from '@/components/app/alert-list';
import { DashboardMap } from '@/components/app/dashboard-map';
import { MapFilterBar } from '@/components/app/map-filter-bar';
import { WeatherCard } from '@/components/app/weather-card';
import { useAirQuality } from '@/hooks/use-air-quality';
import { useMapData } from '@/hooks/use-map-data';
import { useUserLocation } from '@/hooks/use-user-location';
import { useWeather } from '@/hooks/use-weather';
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

export default function DashboardPage() {
  const t = useTranslations('map');
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
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

  // GPS location is used until the user pans the map
  const effectiveCenter = mapCenter ?? userLocation ?? DEFAULT_LOCATION;
  const { pins, flowSegments, isLoading: mapLoading, error: mapError, refresh: mapRefresh } = useMapData(effectiveCenter);

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
      <div className="h-1/2 w-full shrink-0 overflow-y-auto border-b border-border lg:h-full lg:w-[400px] lg:border-b-0 lg:border-r">
        <div className="p-4">
          <WeatherCard
            weather={weather}
            isLoading={isLoading}
            error={error}
            locationLabel={isGps ? t('yourLocation') : t('defaultLocation')}
            onRetry={refresh}
            airQuality={airQuality}
            aqiLoading={aqiIsLoading}
          />
        </div>
        <AlertList
          selectedId={selectedAlertId}
          onSelect={(id) => setSelectedAlertId(String(id))}
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
        />
      </div>
    </div>
  );
}
