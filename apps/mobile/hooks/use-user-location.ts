// Mobile uses react-native-maps showsUserLocation for the blue dot.
// This hook is not needed on mobile — the map component handles
// initial centering via onUserLocationChange callback.
// Kept as a stub for API parity with web.

export const SLOVAKIA_CENTER = { lat: 48.67, lng: 19.70 } as const;
export const GPS_DELTA = 0.06;
export const FALLBACK_DELTA = 4.0;
