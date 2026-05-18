'use client';

import { IconCheck, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import type { NotificationHistoryItem } from '@notifio/api-client';
import { ApiError } from '@notifio/api-client';
import {
  ACCENT_COLORS,
  COMMUNITY_CATEGORIES,
  SEVERITY_COLORS,
  hexToRgba,
} from '@notifio/shared';

import { RelativeTime } from '@/components/ui/relative-time';
import { api } from '@/lib/api';
import { getNotificationIcon } from '@/lib/notification-icons';
import { normalizeSeverity } from '@/lib/severity';

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
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const tn = useTranslations('notificationType');
  const tcb = useTranslations('categoryBadge');
  const te = useTranslations('events');
  const tsev = useTranslations('notificationSeverity');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === 'dark';

  // Resolved derivation: drive from typed fields only. Delivery `status`
  // and title prefixes are intentionally NOT consulted — they produced
  // false positives (failed/filtered deliveries shown as "Ukončené",
  // stale weather-warning all-clear titles after window extensions).
  const resolved =
    notification.notificationType === 'all_clear' ||
    notification.eventStatus === 'resolved';
  const severity = normalizeSeverity(notification.severity);
  const icon = getNotificationIcon(notification.category);
  const accentColor = resolved
    ? '#34C759'
    : (ACCENT_COLORS[severity] ?? '#3A86FF');

  const iconBgAlpha = isDark ? 0.15 : 0.1;
  const isCommunity = COMMUNITY_CATEGORIES.has(notification.category);

  // Voting state (community events only)
  const [voted, setVoted] = useState<boolean | null>(null);
  const [voting, setVoting] = useState(false);

  const handleVote = async (isValid: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    if (voted !== null || voting) return;
    setVoting(true);
    try {
      await api.voteOnEvent(notification.eventId, isValid);
      setVoted(isValid);
    } catch (err) {
      // Only mark as voted on 409 CONFLICT (already voted)
      if (err instanceof ApiError && err.status === 409) {
        setVoted(isValid);
      }
      // Other errors: leave UI in original state
    } finally {
      setVoting(false);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/events/${notification.eventId}`);
    }
  };

  // Category badge label — uses the category field directly (no title-string inference)
  const categoryLabel = tcb.has(notification.category)
    ? tcb(notification.category)
    : null;

  return (
    <button
      onClick={handleClick}
      className={`flex w-full cursor-pointer text-left rounded-xl ${isSelected ? 'border-l-[5px]' : 'border-l-[3px]'} bg-card transition-colors duration-150 hover:bg-card/80 ${isLoading ? 'animate-pulse' : ''}`}
      style={{ borderLeftColor: accentColor, opacity: resolved ? 0.55 : 1 }}
    >
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
                    SEVERITY_COLORS[severity]?.bg ?? 'rgba(58,134,255,0.15)',
                  color:
                    SEVERITY_COLORS[severity]?.text ?? '#3A86FF',
                }}
              >
                {tsev(severity)}
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

          {/* Simplified voting for community events */}
          {isCommunity && !resolved && (
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <span className="text-[11px] text-muted">{te('stillHappening')}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => handleVote(true, e)}
                  disabled={voted !== null || voting}
                  className={`inline-flex items-center gap-1 text-[11px] font-medium transition-colors disabled:opacity-50 ${voted === true ? 'text-green-500 font-bold' : 'text-green-600 hover:text-green-500'}`}
                >
                  <IconCheck size={12} />
                  {te('confirm')}
                </button>
                <button
                  onClick={(e) => handleVote(false, e)}
                  disabled={voted !== null || voting}
                  className={`inline-flex items-center gap-1 text-[11px] font-medium transition-colors disabled:opacity-50 ${voted === false ? 'text-red-500 font-bold' : 'text-red-500 hover:text-red-400'}`}
                >
                  <IconX size={12} />
                  {te('deny')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
