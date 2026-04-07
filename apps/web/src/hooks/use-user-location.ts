'use client';

import { useEffect, useState } from 'react';

interface UserLocation {
  lat: number;
  lng: number;
}

const SLOVAKIA_CENTER: UserLocation = { lat: 48.67, lng: 19.70 };

interface UseUserLocationResult {
  location: UserLocation;
  isGps: boolean;
  loading: boolean;
}

export function useUserLocation(): UseUserLocationResult {
  const [location, setLocation] = useState<UserLocation>(SLOVAKIA_CENTER);
  const [isGps, setIsGps] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsGps(true);
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }, []);

  return { location, isGps, loading };
}
