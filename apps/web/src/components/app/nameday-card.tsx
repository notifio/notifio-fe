'use client';

import { IconCake } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

interface NamedayCardProps {
  name: string | null;
  loading: boolean;
}

export function NamedayCard({ name, loading }: NamedayCardProps) {
  const t = useTranslations('nameday');

  if (loading || !name) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border-l-[3px] border-accent bg-card px-4 py-3">
      <IconCake size={20} className="shrink-0 text-accent" />
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
          {t('label')}
        </p>
        <p className="text-sm font-semibold text-text-primary">{name}</p>
      </div>
    </div>
  );
}
