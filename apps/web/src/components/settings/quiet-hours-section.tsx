'use client';

import { useTranslations } from 'next-intl';

import { useMembership } from '@notifio/shared/hooks';

import { PreferenceSection } from '@/components/app/settings/preference-section';
import { Toggle } from '@/components/ui/toggle';
import { usePreferences } from '@/hooks/use-preferences';

const DEFAULT_START = '22:00';
const DEFAULT_END = '07:00';

export function QuietHoursSection() {
  const t = useTranslations('notificationPreferences');
  const { preferences, setQuietHours, isLoading } = usePreferences();
  const { membership } = useMembership();

  const available =
    membership?.current?.features.includes('quiet_hours') ?? false;
  const start = preferences?.quietHours?.start ?? null;
  const end = preferences?.quietHours?.end ?? null;
  const enabled = start !== null && end !== null;

  if (isLoading) return null;

  return (
    <PreferenceSection title={t('quietHours')}>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-text-primary">
          {t('quietHoursEnabled')}
        </span>
        <Toggle
          checked={enabled}
          disabled={!available}
          onChange={(checked) =>
            setQuietHours(
              checked ? DEFAULT_START : null,
              checked ? DEFAULT_END : null,
            )
          }
        />
      </div>
      {!available && (
        <p className="mt-1 text-xs text-muted">{t('quietHoursProOnly')}</p>
      )}
      {available && enabled && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs text-muted">
            {t('quietHoursFrom')}
            <input
              type="time"
              value={start ?? DEFAULT_START}
              onChange={(e) => setQuietHours(e.target.value, end)}
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-text-primary focus:border-accent focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            {t('quietHoursTo')}
            <input
              type="time"
              value={end ?? DEFAULT_END}
              onChange={(e) => setQuietHours(start, e.target.value)}
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-text-primary focus:border-accent focus:outline-none"
            />
          </label>
        </div>
      )}
    </PreferenceSection>
  );
}
