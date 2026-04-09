'use client';

import { useEffect, useState } from 'react';

interface UserLocation {
  lat: number;
  lng: number;
}

const SLOVAKIA_CENTER: UserLocation = { lat: 48.67, lng: 19.70 };
const STORAGE_KEY = 'notifio:userLocation';

function getStoredLocation(): UserLocation | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as { lat: number; lng: number };
    if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') return parsed;
  } catch {
    // Corrupted or unavailable — ignore
  }
  return null;
}

interface UseUserLocationResult {
  location: UserLocation;
  isGps: boolean;
  loading: boolean;
}

export function useUserLocation(): UseUserLocationResult {
  const [location, setLocation] = useState<UserLocation>(
    () => getStoredLocation() ?? SLOVAKIA_CENTER,
  );
  const [isGps, setIsGps] = useState(() => getStoredLocation() !== null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);
        setIsGps(true);
        setLoading(false);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(coords));
      },
      () => {
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }, []);

  return { location, isGps, loading };
}
