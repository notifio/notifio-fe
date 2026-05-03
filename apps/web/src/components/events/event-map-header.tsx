'use client';

import maplibregl from 'maplibre-gl';
import { useEffect, useRef } from 'react';

import 'maplibre-gl/dist/maplibre-gl.css';

import { TILE_DARK } from '@/lib/map-config';

interface EventMapHeaderProps {
  lat: number;
  lng: number;
  className?: string;
}

/**
 * Non-interactive MapLibre preview at the top of the event detail
 * page. Shows the event's location as a brand-orange marker over a
 * dark CARTO basemap (same style URL as the dashboard map). Drag,
 * zoom, scroll, and rotate are all disabled — this is a header
 * preview, not a navigation surface. Tap the dedicated /map link
 * (future: ?focus=eventId) to interact.
 */
export function EventMapHeader({ lat, lng, className }: EventMapHeaderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: TILE_DARK,
      center: [lng, lat],
      zoom: 14,
      interactive: false,
      attributionControl: { compact: true },
    });

    new maplibregl.Marker({ color: '#FF7A2F' })
      .setLngLat([lng, lat])
      .addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // Coords change → effect re-runs → cleanup remounts a fresh map.
    // Acceptable for the rare case the user navigates between two
    // events without unmounting the component.
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      className={className ?? 'h-40 w-full overflow-hidden'}
      aria-label="Event location map"
    />
  );
}
