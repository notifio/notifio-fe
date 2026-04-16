'use client';

import type { Icon } from '@tabler/icons-react';
import { IconAdjustments, IconInfoCircle, IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useEffect, useMemo, useRef, useState } from 'react';

import { hexToRgba } from '@/lib/color';
import {
  MAP_FILTER_SOURCES,
  MAP_PIN_STYLES,
  TRAFFIC_ICON_MAP,
  TRAFFIC_TYPE_COLORS,
} from '@/lib/map-pin-config';
import type { MapPin, MapPinSource, TrafficIncidentType } from '@/lib/normalize-pins';

import { AdPlaceholder } from './ad-placeholder';

const TRAFFIC_SUBCATEGORIES: TrafficIncidentType[] = [
  'accident',
  'construction',
  'road_closure',
  'congestion',
  'event',
  'other',
];

// Darker shades for light-mode icons
const LIGHT_ICON_COLORS: Record<string, string> = {
  '#EAB308': '#B8930A',
  '#3A86FF': '#2B6BCC',
  '#FF3B30': '#CC2E25',
  '#8B5CF6': '#6D48C4',
  '#FF7A2F': '#CC6125',
  '#991B1B': '#7A1515',
  '#6B7A99': '#55627A',
};

interface MapFilterBarProps {
  activeFilters: Set<MapPinSource>;
  activeTrafficTypes: Set<TrafficIncidentType>;
  onToggle: (source: MapPinSource) => void;
  onToggleTrafficType: (type: TrafficIncidentType) => void;
  pins: MapPin[];
}

// ── Toggle ───────────────────────────────────────────────────────────
function Toggle({
  on,
  onToggle,
  partial,
  isDark,
  small,
}: {
  on: boolean;
  onToggle: () => void;
  partial?: boolean;
  isDark: boolean;
  small?: boolean;
}) {
  const w = small ? 30 : 36;
  const h = small ? 16 : 20;
  const knob = small ? 12 : 16;
  const pad = 2;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      style={{
        position: 'relative',
        width: `${w}px`,
        height: `${h}px`,
        borderRadius: `${h / 2}px`,
        backgroundColor: on
          ? '#FF7A2F'
          : isDark
            ? 'rgba(255,255,255,0.15)'
            : 'rgba(14,34,63,0.15)',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 200ms',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: `${pad}px`,
          left: on ? `${w - knob - pad}px` : `${pad}px`,
          width: `${knob}px`,
          height: `${knob}px`,
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          opacity: partial ? 0.6 : 1,
          transition: 'left 200ms, opacity 200ms',
        }}
      />
    </button>
  );
}

// ── Icon in tinted square ────────────────────────────────────────────
function CategoryIcon({
  icon: IconComponent,
  color,
  isDark,
  size,
  iconSize,
  radius,
}: {
  icon: Icon;
  color: string;
  isDark: boolean;
  size: number;
  iconSize: number;
  radius: number;
}) {
  const strokeColor = isDark ? color : (LIGHT_ICON_COLORS[color] ?? color);
  const bgAlpha = isDark ? 0.15 : 0.12;

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${radius}px`,
        backgroundColor: hexToRgba(color, bgAlpha),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <IconComponent size={iconSize} color={strokeColor} strokeWidth={2} />
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────
export function MapFilterBar({
  activeFilters,
  activeTrafficTypes,
  onToggle,
  onToggleTrafficType,
  pins,
}: MapFilterBarProps) {
  const t = useTranslations();
  const tf = useTranslations('mapFilters');
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const textColor = isDark ? '#FFFFFF' : '#0E223F';
  const countColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(14,34,63,0.45)';
  const glassBg = isDark ? 'rgba(14,34,63,0.85)' : 'rgba(255,255,255,0.88)';
  const glassBorder = isDark ? 'rgba(31,58,95,0.6)' : 'rgba(226,232,240,0.8)';
  const dividerColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(14,34,63,0.08)';

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const sourceCounts = useMemo(() => {
    const map = new Map<MapPinSource, number>();
    for (const pin of pins) {
      map.set(pin.source, (map.get(pin.source) ?? 0) + 1);
    }
    return map;
  }, [pins]);

  const trafficTypeCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const pin of pins) {
      if (pin.source === 'traffic') {
        const type = pin.incidentType ?? 'other';
        map.set(type, (map.get(type) ?? 0) + 1);
      }
    }
    return map;
  }, [pins]);

  const totalFilters = MAP_FILTER_SOURCES.length;
  const activeCount = MAP_FILTER_SOURCES.filter((s) => activeFilters.has(s)).length;
  const hasInactiveFilters = activeCount < totalFilters;

  const trafficIsActive = activeFilters.has('traffic');
  const trafficSubsWithData = TRAFFIC_SUBCATEGORIES.filter(
    (type) => (trafficTypeCounts.get(type) ?? 0) > 0
  );
  const activeTrafficCount = trafficSubsWithData.filter((type) =>
    activeTrafficTypes.has(type)
  ).length;
  const trafficIsPartial =
    trafficIsActive && activeTrafficCount > 0 && activeTrafficCount < trafficSubsWithData.length;

  return (
    <div
      ref={panelRef}
      style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10 }}
    >
      {/* ── Collapsed button ──────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: isOpen ? 'none' : 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: glassBg,
          color: textColor,
          border: `0.5px solid ${glassBorder}`,
          borderRadius: '12px',
          padding: '10px 16px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <IconAdjustments size={18} />
        {tf('title')}
        {hasInactiveFilters && (
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#FF7A2F',
              flexShrink: 0,
            }}
          />
        )}
      </button>

      {/* ── Expanded panel ────────────────────────────────────────── */}
      <div
        style={{
          opacity: isOpen ? 1 : 0,
          maxHeight: isOpen ? '800px' : '0px',
          overflow: 'hidden',
          transition: 'opacity 200ms ease, max-height 200ms ease',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      >
        <div
          style={{
            backgroundColor: glassBg,
            border: `0.5px solid ${glassBorder}`,
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            minWidth: '260px',
            color: textColor,
            overflowY: 'auto',
            maxHeight: '85vh',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px 10px',
            }}
          >
            <span
              style={{
                fontSize: '13px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                opacity: 0.6,
              }}
            >
              {tf('title')}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              aria-label={tf('close')}
              style={{
                background: 'none',
                border: 'none',
                borderRadius: '8px',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: textColor,
                opacity: 0.5,
              }}
            >
              <IconX size={16} />
            </button>
          </div>

          {/* Filter rows */}
          <div style={{ paddingBottom: '4px' }}>
            {MAP_FILTER_SOURCES.map((source) => {
              const style = MAP_PIN_STYLES[source];
              const isActive = activeFilters.has(source);
              const count = sourceCounts.get(source) ?? 0;
              const isTraffic = source === 'traffic';

              return (
                <div key={source}>
                  {/* Divider before traffic */}
                  {isTraffic && (
                    <div
                      style={{
                        height: '0.5px',
                        backgroundColor: dividerColor,
                        margin: '4px 16px',
                      }}
                    />
                  )}

                  {/* Top-level row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px',
                      minHeight: '48px',
                    }}
                  >
                    <CategoryIcon
                      icon={style.icon}
                      color={style.color}
                      isDark={isDark}
                      size={44}
                      iconSize={28}
                      radius={10}
                    />
                    <span
                      style={{
                        flex: 1,
                        fontSize: '14px',
                        fontWeight: isTraffic ? 500 : 400,
                      }}
                    >
                      {t(style.label)}
                    </span>
                    <span style={{ fontSize: '12px', color: countColor, marginRight: '8px' }}>
                      {count}
                    </span>
                    <Toggle
                      on={isActive}
                      onToggle={() => onToggle(source)}
                      partial={isTraffic && trafficIsPartial}
                      isDark={isDark}
                    />
                  </div>

                  {/* Traffic subcategories */}
                  {isTraffic && trafficIsActive && trafficSubsWithData.length > 0 && (
                    <div>
                      {trafficSubsWithData.map((type) => {
                        const subCount = trafficTypeCounts.get(type) ?? 0;
                        const subActive = activeTrafficTypes.has(type);
                        const SubIcon = TRAFFIC_ICON_MAP[type] ?? IconInfoCircle;
                        const subColor = TRAFFIC_TYPE_COLORS[type] ?? '#6B7A99';

                        return (
                          <div
                            key={type}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              paddingLeft: '48px',
                              paddingRight: '16px',
                              paddingTop: '6px',
                              paddingBottom: '6px',
                              minHeight: '40px',
                            }}
                          >
                            <CategoryIcon
                              icon={SubIcon}
                              color={subColor}
                              isDark={isDark}
                              size={36}
                              iconSize={22}
                              radius={6}
                            />
                            <span style={{ flex: 1, fontSize: '13px', opacity: 0.75 }}>
                              {tf(type)}
                            </span>
                            <span
                              style={{
                                fontSize: '12px',
                                color: countColor,
                                marginRight: '8px',
                              }}
                            >
                              {subCount}
                            </span>
                            <Toggle
                              on={subActive}
                              onToggle={() => onToggleTrafficType(type)}
                              isDark={isDark}
                              small
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Ad placement */}
          <div style={{ padding: '0 12px 12px' }}>
            <AdPlaceholder variant="inline" />
          </div>
        </div>
      </div>
    </div>
  );
}
