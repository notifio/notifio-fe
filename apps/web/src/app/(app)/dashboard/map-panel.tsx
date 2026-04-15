'use client';

import { IconPlus } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { DashboardMap } from '@/components/app/dashboard-map';
import { EventReportModal } from '@/components/app/event-report-modal';
import { MapAdBanner } from '@/components/app/map-ad-banner';
import { MapFilterBar } from '@/components/app/map-filter-bar';
import { useMapData } from '@/hooks/use-map-data';
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

interface MapPanelProps {
  userLocation: { lat: number; lng: number } | null;
  isGps: boolean;
  selectedAlertId: string | null;
  onEventLoadingChange: (loading: boolean) => void;
  onEventErrorChange: (error: string | null) => void;
  onClearSelection: () => void;
}

export function MapPanel({
  userLocation,
  isGps,
  selectedAlertId,
  onEventLoadingChange,
  onEventErrorChange,
  onClearSelection,
}: MapPanelProps) {
  const t = useTranslations('map');
  const [activeFilters, setActiveFilters] = useState<Set<MapPinSource>>(
    () => new Set(MAP_FILTER_SOURCES),
  );
  const [activeTrafficTypes, setActiveTrafficTypes] = useState<Set<TrafficIncidentType>>(
    () => new Set(ALL_TRAFFIC_TYPES),
  );
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [flyTo, setFlyTo] = useState<FlyToTarget | null>(null);
  const [infoOverlay, setInfoOverlay] = useState<InfoOverlay | null>(null);

  const effectiveCenter = mapCenter ?? userLocation ?? DEFAULT_LOCATION;
  const { pins, flowSegments, isLoading: mapLoading, error: mapError, refresh: mapRefresh } = useMapData(effectiveCenter);

  // Fetch event detail when a notification is selected
  useEffect(() => {
    if (!selectedAlertId) {
      setFlyTo(null);
      setInfoOverlay(null);
      onEventErrorChange(null);
      return;
    }

    let cancelled = false;
    onEventLoadingChange(true);
    onEventErrorChange(null);

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
        onEventErrorChange(t('eventUnavailable'));
        onClearSelection();
      })
      .finally(() => {
        if (!cancelled) onEventLoadingChange(false);
      });

    return () => { cancelled = true; };
  }, [selectedAlertId, pins, t, onEventLoadingChange, onEventErrorChange, onClearSelection]);

  // Auto-dismiss info overlay after 5 seconds
  useEffect(() => {
    if (!infoOverlay) return;
    const timer = setTimeout(() => {
      setInfoOverlay(null);
      onClearSelection();
    }, 5000);
    return () => clearTimeout(timer);
  }, [infoOverlay, onClearSelection]);

  const handleCloseOverlay = useCallback(() => {
    setInfoOverlay(null);
    onClearSelection();
  }, [onClearSelection]);

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
        center={userLocation ?? undefined}
        isGpsCenter={isGps}
        onCenterChange={setMapCenter}
        flyTo={flyTo}
        onFlyToComplete={handleFlyToComplete}
        infoOverlay={infoOverlay}
        onCloseOverlay={handleCloseOverlay}
      />

      <MapAdBanner />

      {/* Report event FAB — positioned above map attribution + ad banner */}
      <button
        onClick={() => setReportOpen(true)}
        className="absolute bottom-24 right-16 z-20 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
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
  );
}
