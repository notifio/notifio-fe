'use client';

import { useCallback, useState } from 'react';

import { DashboardMap } from '@/components/app/dashboard-map';
import { MapFilterBar } from '@/components/app/map-filter-bar';
import { useMapData } from '@/hooks/use-map-data';
import { useUserLocation } from '@/hooks/use-user-location';
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

export default function MapPage() {
  const [activeFilters, setActiveFilters] = useState<Set<MapPinSource>>(
    () => new Set(MAP_FILTER_SOURCES),
  );
  const [activeTrafficTypes, setActiveTrafficTypes] = useState<Set<TrafficIncidentType>>(
    () => new Set(ALL_TRAFFIC_TYPES),
  );
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const { location: userLocation, isGps } = useUserLocation();

  const effectiveCenter = mapCenter ?? userLocation ?? DEFAULT_LOCATION;
  const { pins, flowSegments, isLoading, error, refresh } = useMapData(effectiveCenter);

  const toggleFilter = useCallback((source: MapPinSource) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(source)) {
        next.delete(source);
        if (source === 'traffic') setActiveTrafficTypes(new Set());
      } else {
        next.add(source);
        if (source === 'traffic') setActiveTrafficTypes(new Set(ALL_TRAFFIC_TYPES));
      }
      return next;
    });
  }, []);

  const toggleTrafficType = useCallback((type: TrafficIncidentType) => {
    setActiveTrafficTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
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
    <div className="relative h-[calc(100vh-3.5rem)]">
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
        isLoading={isLoading}
        error={error}
        onRetry={refresh}
        center={userLocation}
        isGpsCenter={isGps}
        onCenterChange={setMapCenter}
      />
    </div>
  );
}
