import { formatTimeAgo } from '@notifio/shared';

import { getPinStyle } from '@/lib/map-pin-config';
import type { PinStyle } from '@/lib/map-pin-config';
import type { MapPin } from '@/lib/normalize-pins';

interface MapMarkerProps {
  pin: MapPin;
  isExpanded: boolean;
  theme: 'light' | 'dark';
  labels: { scheduled: string; active: string };
  clusterCount?: number;
  onToggle: () => void;
  onClose: () => void;
}

// The pin SVG dimensions — used as the fixed wrapper size so MapLibre's
// anchor: 'bottom' always resolves to the same pixel regardless of state.
const PIN_W = 30;
const PIN_H = 40;
const TRIANGLE_H = 6;

function TeardropSvg({ style, iconColor }: { style: PinStyle; iconColor: string }) {
  return (
    <svg
      width={PIN_W}
      height={PIN_H}
      viewBox="0 0 24 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Teardrop shape */}
      <path
        d="M12 0C5.373 0 0 5.373 0 12c0 8 12 20 12 20s12-12 12-20C24 5.373 18.627 0 12 0z"
        fill={style.color}
      />
      {/* Tabler icon — scaled from 24x24 to 12x12, centered at (12,12) in the teardrop */}
      <g
        transform="translate(6,6) scale(0.5)"
        fill="none"
        stroke={iconColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {style.iconPaths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}

export function MapMarker({
  pin,
  isExpanded,
  theme,
  labels,
  clusterCount,
  onToggle,
  onClose,
}: MapMarkerProps) {
  const style = getPinStyle(pin);
  const iconColor = theme === 'dark' ? '#FFFFFF' : '#FFFFFF';

  // Fixed-size wrapper: MapLibre anchor: 'bottom' places bottom-center at the
  // map coordinate.  Because this wrapper never changes size the anchor pixel
  // stays rock-steady whether the pin is collapsed, expanded, or a cluster.
  return (
    <div
      style={{
        position: 'relative',
        width: `${PIN_W}px`,
        height: `${PIN_H}px`,
        overflow: 'visible',
      }}
    >
      {isExpanded ? (
        <>
          {/* Expanded info pill — grows upward & to the right */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              bottom: `${TRIANGLE_H}px`,
              left: '0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: style.color,
              borderRadius: '12px',
              padding: '8px 12px',
              width: 'max-content',
              maxWidth: '280px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              cursor: 'default',
              animation: 'pin-expand 250ms ease-out',
              transformOrigin: 'bottom left',
            }}
          >
            {/* Content */}
            <div style={{ flex: 1, minWidth: 0, color: '#FFFFFF' }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {pin.title}
              </div>
              {pin.description && (
                <div
                  style={{
                    fontSize: '10px',
                    opacity: 0.8,
                    marginTop: '1px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {pin.description}
                </div>
              )}
              <div
                style={{
                  fontSize: '10px',
                  opacity: 0.85,
                  marginTop: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {pin.locality && <span>{pin.locality}</span>}
                <span
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    padding: '1px 4px',
                    fontSize: '9px',
                    fontWeight: 600,
                  }}
                >
                  {pin.status === 'scheduled' ? labels.scheduled : labels.active}
                </span>
              </div>
              <div style={{ fontSize: '10px', opacity: 0.65, marginTop: '2px' }}>
                {formatTimeAgo(pin.timestamp)}
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#FFFFFF',
                fontSize: '12px',
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              &times;
            </button>
          </div>

          {/* Triangle — pinned to bottom-center of wrapper */}
          <div
            style={{
              position: 'absolute',
              bottom: '0',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: `${TRIANGLE_H}px solid transparent`,
              borderRight: `${TRIANGLE_H}px solid transparent`,
              borderTop: `${TRIANGLE_H}px solid ${style.color}`,
            }}
          />
        </>
      ) : (
        // Collapsed: teardrop with icon
        <button
          type="button"
          aria-label={pin.title}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
        >
          <TeardropSvg style={style} iconColor={iconColor} />

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
      )}
    </div>
  );
}
