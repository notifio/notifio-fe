'use client';

import { useMemo } from 'react';

import { MAP_FILTER_SOURCES, MAP_PIN_STYLES } from '@/lib/map-pin-config';
import type { MapPin, MapPinSource } from '@/lib/normalize-pins';

interface MapFilterBarProps {
  activeFilters: Set<MapPinSource>;
  onToggle: (source: MapPinSource) => void;
  pins: MapPin[];
}

export function MapFilterBar({ activeFilters, onToggle, pins }: MapFilterBarProps) {
  const counts = useMemo(() => {
    const map = new Map<MapPinSource, number>();
    for (const pin of pins) {
      map.set(pin.source, (map.get(pin.source) ?? 0) + 1);
    }
    return map;
  }, [pins]);

  return (
    <div className="absolute top-6 left-6 z-10 flex gap-2 overflow-x-auto">
      {MAP_FILTER_SOURCES.map((source) => {
        const style = MAP_PIN_STYLES[source];
        const isActive = activeFilters.has(source);
        const count = counts.get(source) ?? 0;

        return (
          <button
            key={source}
            onClick={() => onToggle(source)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition-colors ${
              isActive ? 'text-white shadow-sm' : 'bg-background/90 text-muted hover:bg-background'
            }`}
            style={isActive ? { backgroundColor: style.color } : undefined}
          >
            <span
              className="inline-block size-2 rounded-full"
              style={{ backgroundColor: isActive ? '#FFFFFF' : style.color }}
            />
            {style.label}
            {count > 0 && (
              <span className={isActive ? 'text-white/80' : 'text-muted'}>({count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
