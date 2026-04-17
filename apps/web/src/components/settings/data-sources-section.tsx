'use client';

import { IconAlertTriangle, IconChevronRight, IconDatabase } from '@tabler/icons-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { PreferenceSection } from '@/components/app/settings/preference-section';

export function DataSourcesSection() {
  const t = useTranslations('settings');
  const ts = useTranslations('sources');

  return (
    <PreferenceSection
      title={ts('title')}
      description={ts('description')}
    >
      <div className="space-y-1">
        <Link
          href="/settings/sources"
          className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 transition-colors hover:bg-card/80"
        >
          <IconDatabase size={20} className="shrink-0 text-accent" />
          <span className="flex-1 text-sm font-medium text-text-primary">
            {ts('title')}
          </span>
          <IconChevronRight size={16} className="text-muted" />
        </Link>
        <Link
          href="/settings/sources/preferences"
          className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 transition-colors hover:bg-card/80"
        >
          <IconDatabase size={20} className="shrink-0 text-accent" />
          <span className="flex-1 text-sm font-medium text-text-primary">
            {t('sourcePreferences')}
          </span>
          <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent">PRO</span>
          <IconChevronRight size={16} className="text-muted" />
        </Link>
        <Link
          href="/settings/weather-thresholds"
          className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 transition-colors hover:bg-card/80"
        >
          <IconAlertTriangle size={20} className="shrink-0 text-accent" />
          <span className="flex-1 text-sm font-medium text-text-primary">
            {t('weatherThresholds')}
          </span>
          <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent">PRO</span>
          <IconChevronRight size={16} className="text-muted" />
        </Link>
      </div>
    </PreferenceSection>
  );
}
