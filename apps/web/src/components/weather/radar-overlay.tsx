'use client';

import { IconX } from '@tabler/icons-react';
import maplibregl from 'maplibre-gl';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';

import type { RadarConfig } from '@notifio/api-client';

import { TILE_DARK, TILE_LIGHT } from '@/lib/map-config';
import { buildRadarTileUrl } from '@/lib/radar-url';

const RADAR_SOURCE_ID = 'radar-overlay';
const RADAR_LAYER_ID = 'radar-overlay-layer';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

interface Props {
  config: RadarConfig;
  center: { lat: number; lng: number };
  initialForecast: boolean;
  onClose: () => void;
}

export function RadarOverlay({ config, center, initialForecast, onClose }: Props) {
  const t = useTranslations();
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [showForecast, setShowForecast] = useState(initialForecast);

  const tm = showForecast ? config.timestamps.forecastPlusOne : config.timestamps.now;
  const tileUrl = buildRadarTileUrl(config, config.defaultLayer, tm, API_KEY);

  useEffect(() => {
    if (!containerRef.current) return;
    const style = resolvedTheme === 'dark' ? TILE_DARK : TILE_LIGHT;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style,
      center: [center.lng, center.lat],
      zoom: 7,
      minZoom: config.bounds.minZoom,
      maxZoom: config.bounds.maxZoom,
      interactive: true,
    });
    mapRef.current = map;
    map.on('load', () => {
      map.addSource(RADAR_SOURCE_ID, {
        type: 'raster',
        tiles: [tileUrl],
        tileSize: 256,
      });
      map.addLayer({
        id: RADAR_LAYER_ID,
        type: 'raster',
        source: RADAR_SOURCE_ID,
        paint: { 'raster-opacity': 0.75 },
      });
    });
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng, resolvedTheme]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    if (map.getLayer(RADAR_LAYER_ID)) map.removeLayer(RADAR_LAYER_ID);
    if (map.getSource(RADAR_SOURCE_ID)) map.removeSource(RADAR_SOURCE_ID);
    map.addSource(RADAR_SOURCE_ID, {
      type: 'raster',
      tiles: [tileUrl],
      tileSize: 256,
    });
    map.addLayer({
      id: RADAR_LAYER_ID,
      type: 'raster',
      source: RADAR_SOURCE_ID,
      paint: { 'raster-opacity': 0.75 },
    });
  }, [tileUrl]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal
      className="fixed inset-0 z-[1000] flex flex-col bg-background"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-text-primary">{t('radar.title')}</h2>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-md border border-border p-0.5 text-xs">
            <button
              onClick={() => setShowForecast(false)}
              className={`rounded px-2 py-0.5 ${
                !showForecast ? 'bg-accent text-white' : 'text-muted'
              }`}
            >
              {t('forecast.now')}
            </button>
            <button
              onClick={() => setShowForecast(true)}
              className={`rounded px-2 py-0.5 ${
                showForecast ? 'bg-accent text-white' : 'text-muted'
              }`}
            >
              {t('radar.forecastPlusOne')}
            </button>
          </div>
          <button
            onClick={onClose}
            aria-label={t('common.close')}
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-card"
          >
            <IconX size={20} />
          </button>
        </div>
      </div>
      <div ref={containerRef} className="relative flex-1" />
      <p className="border-t border-border px-4 py-2 text-[10px] text-muted">
        {config.attribution}
      </p>
    </div>
  );
}
