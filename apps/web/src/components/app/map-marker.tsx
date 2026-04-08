import { formatTimeAgo } from '@notifio/shared';

import { getPinStyle } from '@/lib/map-pin-config';
import type { MapPin } from '@/lib/normalize-pins';

interface MapMarkerProps {
  pin: MapPin;
  isExpanded: boolean;
  theme: 'light' | 'dark';
  labels: { scheduled: string; active: string };
  onToggle: () => void;
  onClose: () => void;
}

export function MapMarker({ pin, isExpanded, theme, labels, onToggle, onClose }: MapMarkerProps) {
  const style = getPinStyle(pin);
  const iconColor = theme === 'dark' ? '#FFFFFF' : '#0E223F';

  if (isExpanded) {
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: style.color,
          borderRadius: '12px',
          padding: '8px 12px',
          maxWidth: '280px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          cursor: 'default',
          animation: 'pin-expand 250ms ease-out',
          transformOrigin: 'bottom left',
        }}
      >
        {/* Teardrop point */}
        <div
          style={{
            position: 'absolute',
            bottom: '-6px',
            left: '12px',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: `6px solid ${style.color}`,
          }}
        />

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
          ×
        </button>
      </div>
    );
  }

  // Collapsed: teardrop shape
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      style={{
        position: 'relative',
        cursor: 'pointer',
        width: '24px',
        height: '32px',
      }}
    >
      <svg
        width="24"
        height="32"
        viewBox="0 0 24 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 0C5.373 0 0 5.373 0 12c0 8 12 20 12 20s12-12 12-20C24 5.373 18.627 0 12 0z"
          fill={style.color}
        />
        <circle cx="12" cy="11" r="5" fill={iconColor} fillOpacity="0.9" />
      </svg>
    </div>
  );
}
