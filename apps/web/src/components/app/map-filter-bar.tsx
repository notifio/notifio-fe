'use client';

import { IconAdjustments, IconInfoCircle, IconLock, IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  MAP_FILTER_SOURCES,
  SOURCE_REQUIRED_TIER,
  TRAFFIC_SUBCATEGORIES,
  TRAFFIC_TYPE_COLORS,
  type MapPin,
  type MapPinSource,
  type MapPinTrafficType,
} from '@notifio/shared/map';

import { MAP_PIN_STYLES, TRAFFIC_ICON_MAP } from '@/lib/map-pin-config';

import { AdPlaceholder } from './ad-placeholder';
import { CategoryIcon } from './category-icon';
import { MapToggle } from './map-toggle';
import { TierBadge } from './tier-badge';

// Step 8: ranks tiers so a single comparison gates a row by required
// tier. `null` is coerced to FREE upstream (anonymous users) so this
// map only needs the three real tiers.
const TIER_ORDER: Record<'FREE' | 'PLUS' | 'PRO', number> = { FREE: 0, PLUS: 1, PRO: 2 };

interface MapFilterBarProps {
  activeFilters: Set<MapPinSource>;
  activeTrafficTypes: Set<MapPinTrafficType>;
  onToggle: (source: MapPinSource) => void;
  onToggleTrafficType: (type: MapPinTrafficType) => void;
  pins: MapPin[];
  /** Step 8: effective user tier. `null` from anonymous sessions is
   *  coerced to FREE by the caller — this prop never carries `null`. */
  tier?: 'FREE' | 'PLUS' | 'PRO';
  /** Step 8: invoked when a locked filter row is tapped — opens the
   *  upsell modal upstream with the row's source. */
  onLockedRowTap?: (source: MapPinSource) => void;
  /** F1 β layout: lifecycle visibility section. */
  showActive: boolean;
  showUpcoming: boolean;
  onToggleShowActive: (next: boolean) => void;
  onToggleShowUpcoming: (next: boolean) => void;
  /** F1 β layout: clears every category source filter (resets to "all on"). */
  onClearCategoryFilters: () => void;
}

// ── Main component ───────────────────────────────────────────────────
export function MapFilterBar({
  activeFilters,
  activeTrafficTypes,
  onToggle,
  onToggleTrafficType,
  pins,
  tier = 'FREE',
  onLockedRowTap,
  showActive,
  showUpcoming,
  onToggleShowActive,
  onToggleShowUpcoming,
  onClearCategoryFilters,
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
            // B5: bound the panel to the viewport so it doesn't bleed
            // off-screen on short displays. top:24 + bottom:24 = 48px
            // total padding from edges.
            maxHeight: 'calc(100vh - 48px)',
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

          {/* F1 §1 — Lifecycle visibility */}
          <div style={{ padding: '4px 16px 0' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                opacity: 0.6,
                paddingTop: '4px',
                paddingBottom: '4px',
              }}
            >
              {tf('showOnMap')}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '6px',
                paddingBottom: '6px',
              }}
            >
              <span style={{ fontSize: '14px' }}>{tf('activeEvents')}</span>
              <MapToggle
                on={showActive}
                onToggle={() => onToggleShowActive(!showActive)}
                isDark={isDark}
              />
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '6px',
                paddingBottom: '6px',
              }}
            >
              <span style={{ fontSize: '14px' }}>{tf('upcomingEvents')}</span>
              <MapToggle
                on={showUpcoming}
                onToggle={() => onToggleShowUpcoming(!showUpcoming)}
                isDark={isDark}
              />
            </div>
          </div>

          {/* Section divider */}
          <div
            style={{
              height: '1px',
              backgroundColor: dividerColor,
              margin: '12px 16px',
            }}
          />

          {/* F1 §2 — Filter by category, with clear-all link */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px 4px',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                opacity: 0.6,
              }}
            >
              {tf('filterByCategory')}
            </span>
            <button
              onClick={onClearCategoryFilters}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#FF7A2F',
                fontSize: '12px',
                fontWeight: 600,
                padding: 0,
              }}
            >
              {tf('clearAll')}
            </button>
          </div>

          {/* Filter rows */}
          <div style={{ paddingBottom: '4px' }}>
            {MAP_FILTER_SOURCES.map((source) => {
              const style = MAP_PIN_STYLES[source];
              const isActive = activeFilters.has(source);
              const count = sourceCounts.get(source) ?? 0;
              const isTraffic = source === 'traffic';
              // Step 8: lock the row when the source's required tier
              // outranks the user's. `traffic` and `air_quality` are
              // PLUS, `pollen` is PRO; everything else stays FREE.
              const requiredTier = SOURCE_REQUIRED_TIER[source];
              const isLocked = TIER_ORDER[tier] < TIER_ORDER[requiredTier];

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
                    onClick={isLocked ? () => onLockedRowTap?.(source) : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px',
                      minHeight: '48px',
                      opacity: isLocked ? 0.7 : 1,
                      cursor: isLocked ? 'pointer' : 'default',
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
                    {isLocked ? (
                      <>
                        <IconLock size={14} style={{ color: countColor, marginRight: '4px' }} />
                        <TierBadge tier={requiredTier as 'PLUS' | 'PRO'} size="sm" />
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: '12px', color: countColor, marginRight: '8px' }}>
                          {count}
                        </span>
                        <MapToggle
                          on={isActive}
                          onToggle={() => onToggle(source)}
                          partial={isTraffic && trafficIsPartial}
                          isDark={isDark}
                        />
                      </>
                    )}
                  </div>

                  {/* Traffic subcategories */}
                  {!isLocked && isTraffic && trafficIsActive && trafficSubsWithData.length > 0 && (
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
                            <MapToggle
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
