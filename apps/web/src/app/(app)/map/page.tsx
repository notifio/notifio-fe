'use client';

import { IconPlus } from '@tabler/icons-react';
import { useCallback, useState } from 'react';

import { DEFAULT_LOCATION } from '@notifio/shared/geo';
import { useMembership } from '@notifio/shared/hooks';
import { MAP_FILTER_SOURCES, type MapPinSource, type MapPinTrafficType } from '@notifio/shared/map';

import { DashboardMap } from '@/components/app/dashboard-map';
import { EventReportModal } from '@/components/app/event-report-modal';
import { MapAdBanner } from '@/components/app/map-ad-banner';
import { MapFilterBar } from '@/components/app/map-filter-bar';
import { UpsellModal } from '@/components/app/upsell-modal';
import { useMapData } from '@/hooks/use-map-data';
import { useUserLocation } from '@/hooks/use-user-location';

const ALL_TRAFFIC_TYPES: MapPinTrafficType[] = [
  'accident',
  'congestion',
  'construction',
  'event',
  'road_closure',
  'other',
];

export default function MapPage() {
  const [activeFilters, setActiveFilters] = useState<Set<MapPinSource>>(
    () => new Set(MAP_FILTER_SOURCES),
  );
  const [activeTrafficTypes, setActiveTrafficTypes] = useState<Set<MapPinTrafficType>>(
    () => new Set(ALL_TRAFFIC_TYPES),
  );
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  // Step 8: source for the upsell modal — set by teaser pin taps and
  // locked filter row taps; cleared on close.
  const [upsellSource, setUpsellSource] = useState<MapPinSource | null>(null);
  const { location: userLocation, isGps } = useUserLocation();
  const { tier } = useMembership();
  const effectiveTier = (tier ?? 'FREE') as 'FREE' | 'PLUS' | 'PRO';

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

  const toggleTrafficType = useCallback((type: MapPinTrafficType) => {
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
        tier={effectiveTier}
        onLockedRowTap={setUpsellSource}
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
        onTeaserTap={setUpsellSource}
      />
      <UpsellModal source={upsellSource} onClose={() => setUpsellSource(null)} />
      <MapAdBanner />

      {/* Report event FAB */}
      <button
        onClick={() => setReportOpen(true)}
        className="absolute bottom-24 right-8 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <IconPlus size={24} />
      </button>

      {reportOpen && (
        <EventReportModal
          lat={effectiveCenter.lat}
          lng={effectiveCenter.lng}
          onClose={() => {
            setReportOpen(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}
