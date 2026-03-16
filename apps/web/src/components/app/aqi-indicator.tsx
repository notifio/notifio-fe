'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

import type { AirQualityData } from '@notifio/shared';
import { AQ_COMPONENT_INFO, getAqiStyle } from '@notifio/shared/air-quality';

interface AqiIndicatorProps {
  airQuality: AirQualityData | null;
  isLoading: boolean;
}

export function AqiIndicator({ airQuality, isLoading }: AqiIndicatorProps) {
  const [expanded, setExpanded] = useState(false);

  if (isLoading) {
    return <div className="h-9 w-40 animate-pulse rounded-lg bg-white/10" />;
  }

  if (!airQuality) return null;

  const aqiStyle = getAqiStyle(airQuality.level);
  const Chevron = expanded ? ChevronUp : ChevronDown;

  return (
    <div>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-left transition-colors hover:bg-white/15"
      >
        <span
          className="inline-block size-2 shrink-0 rounded-full"
          style={{ backgroundColor: aqiStyle.color }}
        />
        <span className="text-sm font-medium">AQI {airQuality.aqi}</span>
        <span className="text-sm opacity-60">{aqiStyle.label}</span>
        <Chevron size={16} className="ml-auto shrink-0 opacity-60" />
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 px-1">
            {Object.entries(airQuality.components).map(([key, value]) => {
              const info = AQ_COMPONENT_INFO[key];
              if (!info) return null;
              return (
                <div key={key} className="flex items-center justify-between text-xs opacity-70">
                  <span>{info.label}</span>
                  <span className="tabular-nums">
                    {(value as number).toFixed(1)} {info.unit}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="px-1 text-xs italic opacity-50">{aqiStyle.description}</p>
        </div>
      )}
    </div>
  );
}
