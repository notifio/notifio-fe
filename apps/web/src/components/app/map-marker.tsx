import { IconCalendar, IconChevronRight, IconX } from '@tabler/icons-react';
import Link from 'next/link';

import { formatRelativeTime, type RelativeTimeLocale } from '@notifio/shared/format';
import type { MapPin } from '@notifio/shared/map';

import { getPinStyle } from '@/lib/map-pin-config';
import type { PinStyle } from '@/lib/map-pin-config';

interface MapMarkerProps {
  pin: MapPin;
  isExpanded: boolean;
  theme: 'light' | 'dark';
  /** Threaded from the dashboard-map root client component — `useLocale`
   *  can't be called here because this subtree is mounted via
   *  `createRoot()` and lacks the next-intl provider context. */
  locale: RelativeTimeLocale;
  labels: { upcoming: string; active: string; viewDetails: string };
  clusterCount?: number;
  onToggle: () => void;
  onClose: () => void;
}

// The pin SVG dimensions — used as the fixed wrapper size so MapLibre's
// anchor: 'bottom' always resolves to the same pixel regardless of state.
const PIN_W = 38;
const PIN_H = 50;

// D1 callout palette (mobile-canonical dark navy card).
const CALLOUT_BG = '#162D4F';
const CALLOUT_TEXT = '#FFFFFF';
const CALLOUT_SUBTLE = '#8B9BB5';
const CALLOUT_DIVIDER = 'rgba(255,255,255,0.08)';
const CALLOUT_X_BG = 'rgba(255,255,255,0.08)';
const ACCENT = '#FF7A2F';
const PILL_GREY_BG = 'rgba(255,255,255,0.10)';
const PILL_GREY_TEXT = '#B6C4DA';

function TeardropSvg({
  style,
  iconColor,
  showUpcomingBadge,
}: {
  style: PinStyle;
  iconColor: string;
  showUpcomingBadge: boolean;
}) {
  const Icon = style.icon;
  return (
    <div style={{ position: 'relative', width: `${PIN_W}px`, height: `${PIN_H}px` }}>
      {/* Teardrop background shape */}
      <svg
        width={PIN_W}
        height={PIN_H}
        viewBox="0 0 24 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <path
          d="M12 0C5.373 0 0 5.373 0 12c0 8 12 20 12 20s12-12 12-20C24 5.373 18.627 0 12 0z"
          fill={style.color}
        />
      </svg>
      {/* Tabler icon centered in the circle part of the teardrop */}
      <div
        style={{
          position: 'absolute',
          top: '7px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '18px',
          height: '18px',
        }}
      >
        <Icon size={18} color={iconColor} strokeWidth={2.5} />
      </div>
      {/* D2 calendar badge for upcoming pins (variant B) */}
      {showUpcomingBadge && (
        <div
          style={{
            position: 'absolute',
            top: '-3px',
            right: '-3px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#162D4F',
            border: '1.5px solid #FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconCalendar size={10} color="#FFFFFF" stroke={2.4} />
        </div>
      )}
    </div>
  );
}

export function MapMarker({
  pin,
  isExpanded,
  theme,
  locale,
  labels,
  clusterCount,
  onToggle,
  onClose,
}: MapMarkerProps) {
  const style = getPinStyle(pin);
  const iconColor = theme === 'dark' ? '#FFFFFF' : '#FFFFFF';
  // Step 8: greyed-out preview style for off-tier teaser pins. The pin
  // stays in place so the user sees coverage exists, but it never
  // expands the popup — tap routes to the upsell modal upstream.
  const teaserStyle: React.CSSProperties = pin.isTeaser
    ? { opacity: 0.45, filter: 'grayscale(80%)' }
    : {};
  const showExpanded = isExpanded && !pin.isTeaser;

  // Fixed-size wrapper: MapLibre anchor: 'bottom' places bottom-center at the
  // map coordinate.  Because this wrapper never changes size the anchor pixel
  // stays rock-steady whether the pin is collapsed, expanded, or a cluster.
  // B6: when expanded, raise z-index so the callout overlays neighbouring
  // pins instead of being clipped by them.
  const isUpcoming = !pin.isTeaser && pin.status === 'upcoming';

  return (
    <div
      style={{
        position: 'relative',
        width: `${PIN_W}px`,
        height: `${PIN_H}px`,
        overflow: 'visible',
        zIndex: showExpanded ? 1000 : undefined,
        ...teaserStyle,
      }}
    >
      {/* Always render the pin so the callout has a visual anchor */}
      <button
        type="button"
        aria-label={pin.title}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        style={{
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          padding: 0,
          position: 'absolute',
          inset: 0,
        }}
      >
        <TeardropSvg
          style={style}
          iconColor={iconColor}
          showUpcomingBadge={isUpcoming}
        />

        {/* Cluster red badge */}
        {clusterCount != null && clusterCount > 1 && (
          <div
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#FF3B30',
              color: 'white',
              fontSize: '11px',
              fontWeight: 600,
              minWidth: '18px',
              height: '18px',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              padding: '0 3px',
              lineHeight: 1,
            }}
          >
            {clusterCount}
          </div>
        )}
      </button>

      {/* D1 — Mobile-canonical callout: dark navy card, dot+title+subtitle,
          time + status pill, X close, border-top + orange details CTA. */}
      {showExpanded && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: `${PIN_H + 8}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'max-content',
            maxWidth: '320px',
            minWidth: '220px',
            backgroundColor: CALLOUT_BG,
            color: CALLOUT_TEXT,
            borderRadius: '16px',
            padding: '14px 16px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
            animation: 'pin-expand 200ms ease-out',
            transformOrigin: 'bottom center',
          }}
        >
          {/* Close X */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="close"
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: CALLOUT_X_BG,
              border: 'none',
              cursor: 'pointer',
              color: CALLOUT_TEXT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            <IconX size={14} />
          </button>

          {/* Title row: colored dot + title */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              paddingRight: '28px',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: style.color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {pin.title}
            </span>
          </div>

          {/* Subtitle */}
          {pin.description && (
            <div
              style={{
                marginTop: '4px',
                fontSize: '13px',
                color: CALLOUT_SUBTLE,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {pin.description}
            </div>
          )}

          {/* Time + status pill row */}
          <div
            style={{
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '12px', color: CALLOUT_SUBTLE }}>
              {formatRelativeTime(pin.timestamp, locale)}
            </span>
            {pin.status === 'upcoming' ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '999px',
                  backgroundColor: PILL_GREY_BG,
                  color: PILL_GREY_TEXT,
                }}
              >
                <IconCalendar size={11} />
                {labels.upcoming}
              </span>
            ) : (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255,122,47,0.15)',
                  color: ACCENT,
                }}
              >
                {labels.active}
              </span>
            )}
          </div>

          {/* Details CTA — post-M3: shows for any pin with an id (traffic
              now flows through /events with proper UUIDs). */}
          {pin.id && (
            <>
              <div
                style={{
                  height: '1px',
                  backgroundColor: CALLOUT_DIVIDER,
                  margin: '12px -16px 10px',
                }}
              />
              <Link
                href={`/events/${pin.id}`}
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: ACCENT,
                  textDecoration: 'none',
                }}
              >
                {labels.viewDetails}
                <IconChevronRight size={14} />
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
