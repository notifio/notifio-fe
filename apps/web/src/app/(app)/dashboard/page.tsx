'use client';

import { useCallback, useState } from 'react';

import { AlertList } from '@/components/app/alert-list';
import { DashboardMap } from '@/components/app/dashboard-map';
import { MapFilterBar } from '@/components/app/map-filter-bar';
import { WeatherCard } from '@/components/app/weather-card';
import { useAirQuality } from '@/hooks/use-air-quality';
import { useMapData } from '@/hooks/use-map-data';
import { useWeather } from '@/hooks/use-weather';
import { DEFAULT_LOCATION } from '@/lib/location';
import { MAP_FILTER_SOURCES } from '@/lib/map-pin-config';
import { MOCK_ALERTS } from '@/lib/mock-data';
import type { MapPinSource } from '@/lib/normalize-pins';

export default function DashboardPage() {
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<MapPinSource>>(
    () => new Set(MAP_FILTER_SOURCES),
  );
  const { weather, isLoading, error, refresh } = useWeather();
  const { airQuality, isLoading: aqiIsLoading } = useAirQuality();
  const { pins, isLoading: mapLoading, error: mapError, refresh: mapRefresh } = useMapData();

  const toggleFilter = useCallback((source: MapPinSource) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(source)) {
        next.delete(source);
      } else {
        next.add(source);
      }
      return next;
    });
  }, []);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col lg:flex-row">
      <div className="h-1/2 w-full shrink-0 overflow-y-auto border-b border-gray-100 lg:h-full lg:w-[400px] lg:border-b-0 lg:border-r">
        <div className="p-4">
          <WeatherCard
            weather={weather}
            isLoading={isLoading}
            error={error}
            locationLabel={DEFAULT_LOCATION.label}
            onRetry={refresh}
            airQuality={airQuality}
            aqiLoading={aqiIsLoading}
          />
        </div>
        <AlertList
          alerts={MOCK_ALERTS}
          selectedId={selectedAlertId}
          onSelect={setSelectedAlertId}
        />
      </div>
      <div className="relative min-h-0 flex-1 p-4">
        <MapFilterBar activeFilters={activeFilters} onToggle={toggleFilter} pins={pins} />
        <DashboardMap
          pins={pins}
          activeFilters={activeFilters}
          isLoading={mapLoading}
          error={mapError}
          onRetry={mapRefresh}
        />
      </div>
    </div>
  );
}
