'use client';

import { useCallback, useEffect, useState } from 'react';

import { useUserLocation } from '@/hooks/use-user-location';

import { LeftPanel } from './left-panel';
import { MapPanel } from './map-panel';

export default function DashboardPage() {
  const { location: userLocation, isGps } = useUserLocation();
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [eventLoading, setEventLoading] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);

  // Clear error after 3 seconds
  useEffect(() => {
    if (!eventError) return;
    const timer = setTimeout(() => setEventError(null), 3000);
    return () => clearTimeout(timer);
  }, [eventError]);

  const handleAlertSelect = useCallback((eventId: string) => {
    setSelectedAlertId((prev) => (prev === eventId ? null : eventId));
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedAlertId(null);
  }, []);

  const handleEventLoadingChange = useCallback((loading: boolean) => {
    setEventLoading(loading);
  }, []);

  const handleEventErrorChange = useCallback((error: string | null) => {
    setEventError(error);
  }, []);

  return (
    <div className="flex h-[calc(100vh-3.5rem-4rem)] flex-col md:h-[calc(100vh-3.5rem)] lg:flex-row">
      <LeftPanel
        userLocation={userLocation}
        isGps={isGps}
        selectedAlertId={selectedAlertId}
        onAlertSelect={handleAlertSelect}
        isLoadingEvent={eventLoading}
        eventError={eventError}
      />
      <MapPanel
        userLocation={userLocation}
        isGps={isGps}
        selectedAlertId={selectedAlertId}
        onEventLoadingChange={handleEventLoadingChange}
        onEventErrorChange={handleEventErrorChange}
        onClearSelection={handleClearSelection}
      />
    </div>
  );
}
