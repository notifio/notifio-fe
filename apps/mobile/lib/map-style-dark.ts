/**
 * Dark map style for Google Maps on Android.
 * Apple Maps on iOS uses native userInterfaceStyle="dark" instead.
 *
 * Style intentionally matches the app's navy palette so the map feels
 * cohesive with the rest of the dark UI (#0E223F bg, #162A4A surfaces).
 */
export const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0E223F' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0E223F' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#A8B3C7' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#FFFFFF' }],
  },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#A8B3C7' }] },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#162A4A' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6B7A99' }],
  },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1F3A5F' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0E223F' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8B9DB8' }] },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2A4A75' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0E223F' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#FFFFFF' }],
  },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1F3A5F' }] },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#A8B3C7' }],
  },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0B1B32' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3A86FF' }] },
];
