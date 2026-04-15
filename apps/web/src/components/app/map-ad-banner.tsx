'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { useMembership } from '@/hooks/use-membership';

export function MapAdBanner() {
  const t = useTranslations('membership');
  const { isFree, loading } = useMembership();

  if (loading || !isFree) return null;

  return (
    <div className="absolute bottom-6 left-0 right-0 z-10 flex items-center gap-3 border-t border-border/30 bg-background/90 px-4 py-2 backdrop-blur-sm">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted/60">
        Sponsored
      </span>
      <div className="h-4 flex-1 rounded bg-border/20" />
      <Link
        href="/pricing"
        className="shrink-0 text-xs font-medium text-accent transition-colors hover:text-accent/80"
      >
        {t('adFree')}
      </Link>
    </div>
  );
}
