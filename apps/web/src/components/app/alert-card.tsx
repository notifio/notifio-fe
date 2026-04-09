'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import type { NotificationHistoryItem } from '@notifio/api-client';

import { RelativeTime } from '@/components/ui/relative-time';
import { getNotificationIcon } from '@/lib/notification-icons';

interface AlertCardProps {
  notification: NotificationHistoryItem;
  duplicateCount?: number;
  isSelected?: boolean;
  onClick?: () => void;
}

function isResolved(n: NotificationHistoryItem): boolean {
  if (n.status !== 'sent') return true;
  if (n.title.startsWith('Ukončené:') || n.title.startsWith('Resolved:')) return true;
  return false;
}

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  critical: { bg: 'rgba(255,59,48,0.15)', text: '#FF3B30' },
  warning: { bg: 'rgba(255,122,47,0.15)', text: '#FF7A2F' },
  info: { bg: 'rgba(58,134,255,0.15)', text: '#3A86FF' },
};

const ACCENT_COLORS: Record<string, string> = {
  critical: '#FF3B30',
  warning: '#FF7A2F',
  info: '#3A86FF',
};

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function AlertCard({
  notification,
  duplicateCount,
  isSelected = false,
  onClick,
}: AlertCardProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === 'dark';

  const resolved = isResolved(notification);
  const icon = getNotificationIcon(notification.category);
  const accentColor = resolved
    ? '#34C759'
    : (ACCENT_COLORS[notification.severity] ?? '#3A86FF');

  const iconBgAlpha = isDark ? 0.15 : 0.1;

  return (
    <button
      onClick={onClick}
      className={`flex w-full text-left rounded-xl bg-card transition-colors hover:bg-card/80 ${
        isSelected ? 'ring-1 ring-accent' : ''
      }`}
      style={{ opacity: resolved ? 0.55 : 1 }}
    >
      {/* Accent bar */}
      <div
        style={{
          width: '3px',
          borderRadius: '3px 0 0 3px',
          backgroundColor: accentColor,
          flexShrink: 0,
        }}
      />

      {/* Content */}
      <div className="flex min-w-0 flex-1 gap-3 p-3">
        {/* Category icon */}
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: hexToRgba(icon.color, iconBgAlpha),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg
            width={28}
            height={28}
            viewBox="0 0 24 24"
            fill={icon.color}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d={icon.path} />
          </svg>
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-primary line-clamp-2">
            {notification.title}
          </p>
          {notification.body && (
            <p className="mt-0.5 text-xs text-text-secondary line-clamp-1">
              {notification.body}
            </p>
          )}

          {/* Meta row */}
          <div className="mt-1.5 flex items-center gap-1.5">
            {/* Severity / resolved badge */}
            {resolved ? (
              <span
                className="rounded px-2 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: 'rgba(52,199,89,0.15)',
                  color: '#34C759',
                }}
              >
                resolved
              </span>
            ) : (
              <span
                className="rounded px-2 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor:
                    SEVERITY_COLORS[notification.severity]?.bg ?? 'rgba(58,134,255,0.15)',
                  color:
                    SEVERITY_COLORS[notification.severity]?.text ?? '#3A86FF',
                }}
              >
                {notification.severity}
              </span>
            )}

            <span className="text-[11px] text-muted">
              <RelativeTime iso={notification.createdAt} />
            </span>

            {duplicateCount != null && duplicateCount > 1 && (
              <span className="rounded bg-card px-2 py-0.5 text-[11px] text-muted">
                &times;{duplicateCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
