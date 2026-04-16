'use client';

import { IconCake } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

interface UpcomingDay {
  date: string;
  names: string[];
}

interface NamedayCardProps {
  todayNames: string[];
  upcomingNames: UpcomingDay[];
  loading: boolean;
}

export function NamedayCard({ todayNames, upcomingNames, loading }: NamedayCardProps) {
  const t = useTranslations('nameday');

  if (loading || todayNames.length === 0) return null;

  const tomorrowDay = upcomingNames[0];

  return (
    <div className="flex items-center gap-3 rounded-xl border-l-[3px] border-accent bg-card px-4 py-3">
      <IconCake size={20} className="shrink-0 text-accent" />
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
          {t('label')}
        </p>
        <p className="text-sm font-semibold text-text-primary">
          {todayNames.join(', ')}
        </p>
        {tomorrowDay && tomorrowDay.names.length > 0 && (
          <p className="mt-0.5 text-[11px] text-muted">
            {t('tomorrow')}: {tomorrowDay.names.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}
