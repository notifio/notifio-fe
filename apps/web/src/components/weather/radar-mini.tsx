'use client';

import { IconArrowsMaximize } from '@tabler/icons-react';
import maplibregl from 'maplibre-gl';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';

import type { RadarConfig } from '@notifio/api-client';
import { RADAR_PRECIPITATION_LEGEND } from '@notifio/shared';

import { TILE_DARK, TILE_LIGHT } from '@/lib/map-config';
import { buildRadarTileUrl } from '@/lib/radar-url';

import { RadarOverlay } from './radar-overlay';

const RADAR_SOURCE_ID = 'radar';
const RADAR_LAYER_ID = 'radar-layer';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

interface Props {
  config: RadarConfig;
  center: { lat: number; lng: number };
}

export function RadarMini({ config, center }: Props) {
  const t = useTranslations();
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [showForecast, setShowForecast] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const tm = showForecast ? config.timestamps.forecastPlusOne : config.timestamps.now;
  const tileUrl = buildRadarTileUrl(config, config.defaultLayer, tm, API_KEY);

  // Init MapLibre once on mount + when center moves
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
      interactive: false,
      attributionControl: false,
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
        paint: { 'raster-opacity': 0.7 },
      });
    });
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng, resolvedTheme]);

  // Swap tile URL when timestamp toggles. setTiles isn't documented for
  // raster sources in maplibre-gl 5.x — recreating the source is the
  // reliable path.
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
      paint: { 'raster-opacity': 0.7 },
    });
  }, [tileUrl]);

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <header className="flex items-center justify-between pb-3">
        <h3 className="text-sm font-semibold text-text-primary">{t('radar.title')}</h3>
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
      </header>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        aria-label={t('radar.expand')}
        className="relative block w-full overflow-hidden rounded-lg"
        style={{ height: 200 }}
      >
        <div ref={containerRef} className="absolute inset-0" />
        <span className="absolute right-2 top-2 rounded-md bg-background/80 p-1 backdrop-blur-sm">
          <IconArrowsMaximize size={14} className="text-text-primary" />
        </span>
      </button>
      <RadarLegend />
      <p className="mt-2 text-[10px] text-muted">{config.attribution}</p>
      {expanded && (
        <RadarOverlay
          config={config}
          center={center}
          initialForecast={showForecast}
          onClose={() => setExpanded(false)}
        />
      )}
    </section>
  );
}

function RadarLegend() {
  const t = useTranslations('radar.legend');
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted">
      {RADAR_PRECIPITATION_LEGEND.map((stop) => (
        <span key={stop.label} className="inline-flex items-center gap-1">
          <span
            className="inline-block h-2 w-3 rounded-sm"
            style={{ backgroundColor: stop.color }}
          />
          {t(stop.label)}
        </span>
      ))}
    </div>
  );
}
