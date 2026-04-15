'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import type { NotificationHistoryItem } from '@notifio/api-client';

import { RelativeTime } from '@/components/ui/relative-time';
import { getNotificationIcon } from '@/lib/notification-icons';

import { ACCENT_COLORS, SEVERITY_COLORS, hexToRgba, isResolved } from './alert-card-utils';

interface AlertCardProps {
  notification: NotificationHistoryItem;
  duplicateCount?: number;
  isSelected?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
}

export function AlertCard({
  notification,
  duplicateCount,
  isSelected = false,
  isLoading = false,
  onClick,
}: AlertCardProps) {
  const { resolvedTheme } = useTheme();
  const tn = useTranslations('notificationType');
  const tcb = useTranslations('categoryBadge');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === 'dark';

  const resolved = isResolved(notification);
  const icon = getNotificationIcon(notification.category);
  const accentColor = resolved
    ? '#34C759'
    : (ACCENT_COLORS[notification.severity] ?? '#3A86FF');

  const iconBgAlpha = isDark ? 0.15 : 0.1;

  // Category badge label — uses the category field directly (no title-string inference)
  const categoryLabel = tcb.has(notification.category)
    ? tcb(notification.category)
    : null;

  return (
    <button
      onClick={onClick}
      className={`flex w-full text-left rounded-xl ${isSelected ? 'border-l-[5px]' : 'border-l-[3px]'} bg-card transition-colors hover:bg-card/80 ${isLoading ? 'animate-pulse' : ''}`}
      style={{ borderLeftColor: accentColor, opacity: resolved ? 0.55 : 1 }}
    >
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
          <icon.icon size={28} color={icon.color} strokeWidth={2} />
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
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {/* Severity / resolved badge */}
            {resolved ? (
              <span
                className="rounded px-2 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: 'rgba(52,199,89,0.15)',
                  color: '#34C759',
                }}
              >
                {tn('all_clear')}
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

            {/* Category badge */}
            {categoryLabel && !resolved && (
              <span
                className="rounded px-2 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: hexToRgba(icon.color, 0.15),
                  color: icon.color,
                }}
              >
                {categoryLabel}
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
