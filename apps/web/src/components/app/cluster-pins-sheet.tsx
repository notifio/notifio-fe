'use client';

import { IconCalendar, IconChevronRight, IconX } from '@tabler/icons-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import type { MapPin } from '@notifio/shared/map';

import { getPinStyle } from '@/lib/map-pin-config';

interface ClusterPinsSheetProps {
  open: boolean;
  pins: MapPin[];
  onClose: () => void;
}

const SM_BREAKPOINT = 640;

/**
 * Stacked-pin sheet: lists every pin under a tapped cluster. Solves the
 * identical-coord stack problem (multiple events at the same lat/lng
 * are otherwise unreachable behind the top pin).
 *
 * Two layouts driven by viewport width:
 *  - ≥640px: centered modal, dim overlay backdrop.
 *  - <640px: slide-up drawer from bottom with drag handle.
 *
 * Tap a row → close + navigate to /events/{id}. Teasers are filtered
 * upstream (sync-markers leaf resolution drops them) so this sheet only
 * sees real events with valid UUIDs.
 */
export function ClusterPinsSheet({ open, pins, onClose }: ClusterPinsSheetProps) {
  const t = useTranslations();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${SM_BREAKPOINT}px)`);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ESC closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || pins.length === 0) return null;

  const first = pins[0]!;
  const headerKey = pins.every((p) => p.lat === first.lat && p.lng === first.lng)
    ? 'mapCluster.eventsAtLocation'
    : 'mapCluster.eventsNearby';
  const title = t(headerKey, { count: pins.length });

  return (
    <div
      className="fixed inset-0 z-50 flex"
      style={{
        alignItems: isDesktop ? 'center' : 'flex-end',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={
          isDesktop
            ? 'mx-4 w-full max-w-md rounded-2xl bg-background shadow-2xl'
            : 'w-full rounded-t-2xl bg-background shadow-2xl'
        }
        style={{
          animation: isDesktop
            ? 'cluster-fade-in 180ms ease-out'
            : 'cluster-slide-up 220ms ease-out',
          maxHeight: isDesktop ? '70vh' : '75vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Mobile drag handle (visual only — backdrop click + X close) */}
        {!isDesktop && (
          <div className="flex justify-center pt-2 pb-1">
            <span className="block h-1 w-10 rounded-full bg-muted/40" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <span className="text-sm font-semibold text-text-primary">{title}</span>
          <button
            onClick={onClose}
            aria-label={t('common.close')}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-card text-muted hover:text-text-primary"
          >
            <IconX size={16} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-1">
          {pins.map((pin) => {
            const style = getPinStyle(pin);
            const Icon = style.icon;
            const isUpcoming = pin.status === 'upcoming';
            const subtitle = pin.locality || pin.description;

            return (
              <Link
                key={pin.id}
                href={`/events/${pin.id}`}
                onClick={onClose}
                className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-card"
              >
                <div className="relative shrink-0">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${style.color}28` }}
                  >
                    <Icon size={18} color={style.color} strokeWidth={2.2} />
                  </div>
                  {isUpcoming && (
                    <div
                      className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: '#162D4F',
                        border: '1.5px solid #FFFFFF',
                      }}
                    >
                      <IconCalendar size={9} color="#FFFFFF" stroke={2.4} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-primary">
                    {pin.title || t('mapCluster.untitledEvent')}
                  </p>
                  {subtitle && (
                    <p className="truncate text-xs text-muted">{subtitle}</p>
                  )}
                </div>
                <IconChevronRight size={16} className="shrink-0 text-muted/50" />
              </Link>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes cluster-fade-in {
          from {
            opacity: 0;
            transform: scale(0.97);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes cluster-slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
