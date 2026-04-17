'use client';

import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTheme } from 'next-themes';
import { useEffect, useRef } from 'react';

import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, TILE_DARK, TILE_LIGHT } from '@/lib/map-config';

interface LocationPickerProps {
  value: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }) => void;
  initialCenter?: { lat: number; lng: number };
  height?: string;
  disabled?: boolean;
}

export function LocationPicker({
  value,
  onChange,
  initialCenter,
  height = '200px',
  disabled = false,
}: LocationPickerProps) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const center = value ?? initialCenter ?? DEFAULT_MAP_CENTER;
  const zoom = value ? 14 : initialCenter ? 14 : DEFAULT_MAP_ZOOM;

  useEffect(() => {
    if (!containerRef.current) return;

    const tileStyle = resolvedTheme === 'dark' ? TILE_DARK : TILE_LIGHT;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: tileStyle,
      center: [center.lng, center.lat],
      zoom,
    });

    const marker = new maplibregl.Marker({ color: '#FF7A2F', draggable: !disabled })
      .setLngLat([center.lng, center.lat])
      .addTo(map);

    if (!disabled) {
      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        onChange({ lat: lngLat.lat, lng: lngLat.lng });
      });

      map.on('click', (e) => {
        marker.setLngLat(e.lngLat);
        onChange({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      });
    }

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line
  }, []);

  // Update marker position when value changes externally
  useEffect(() => {
    if (!markerRef.current || !value) return;
    markerRef.current.setLngLat([value.lng, value.lat]);
  }, [value]);

  return (
    <div className="overflow-hidden rounded-xl border border-border" style={{ height }}>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
