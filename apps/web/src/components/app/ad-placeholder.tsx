'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { useMembership } from '@/hooks/use-membership';
import { cn } from '@/lib/utils';

interface AdPlaceholderProps {
  variant: 'banner' | 'card' | 'inline';
  className?: string;
}

export function AdPlaceholder({ variant, className }: AdPlaceholderProps) {
  const t = useTranslations('membership');
  const { isFree, loading } = useMembership();

  if (loading || !isFree) return null;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-dashed border-border bg-card/50',
        variant === 'banner' && 'flex items-center justify-between px-4 py-3',
        variant === 'card' && 'flex flex-col items-center justify-center p-6',
        variant === 'inline' && 'flex items-center gap-3 px-3 py-2',
        className,
      )}
    >
      <div
        className={cn(
          variant === 'banner' && 'flex items-center gap-3',
          variant === 'card' && 'text-center',
          variant === 'inline' && 'flex-1',
        )}
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted/60">
          Sponsored
        </span>
        {variant === 'card' && (
          <div className="mt-3 h-20 w-full rounded-lg bg-border/30" />
        )}
        {variant === 'banner' && (
          <div className="h-5 w-48 rounded bg-border/30" />
        )}
        {variant === 'inline' && (
          <div className="h-4 w-32 rounded bg-border/30" />
        )}
      </div>

      <Link
        href="/pricing"
        className="shrink-0 text-xs font-medium text-accent transition-colors hover:text-accent/80"
      >
        {t('adFree')}
      </Link>
    </div>
  );
}
