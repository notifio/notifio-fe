'use client';

import { IconCrown } from '@tabler/icons-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { useMembership } from '@/hooks/use-membership';

interface UpsellCardProps {
  variant?: 'inline' | 'sidebar';
}

export function UpsellCard({ variant = 'inline' }: UpsellCardProps) {
  const t = useTranslations('upsell');
  const { isFree, isLoading: loading } = useMembership();

  // Rotate between messages based on day of week
  const messageIndex = useMemo(() => new Date().getDay() % 3, []);

  if (loading || !isFree) return null;

  const messages = [
    { title: t('reminder.title'), description: t('reminder.description') },
    { title: t('locations.title'), description: t('locations.description') },
    { title: t('pollen.title'), description: t('pollen.description') },
  ];

  const msg = messages[messageIndex]!;

  if (variant === 'sidebar') {
    return (
      <div className="rounded-xl border border-dashed border-accent/30 bg-accent/5 p-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <IconCrown size={16} className="text-accent" />
        </div>
        <p className="mt-2 text-xs font-medium text-text-primary">{msg.title}</p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted">{msg.description}</p>
        <Link
          href="/pricing"
          className="mt-3 inline-block rounded-lg bg-accent px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-accent/90"
        >
          {t('upgrade')}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-accent/30 bg-accent/5 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
        <IconCrown size={18} className="text-accent" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-text-primary">{msg.title}</p>
        <p className="mt-0.5 text-[11px] text-muted">{msg.description}</p>
      </div>
      <Link
        href="/pricing"
        className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-accent/90"
      >
        {t('upgrade')}
      </Link>
    </div>
  );
}
