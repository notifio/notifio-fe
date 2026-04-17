'use client';

import { IconCrown } from '@tabler/icons-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { useMembership } from '@/hooks/use-membership';

const TIER_ORDER: Record<string, number> = { FREE: 0, PLUS: 1, PRO: 2 };

interface ProGateProps {
  requiredTier: 'PLUS' | 'PRO';
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProGate({ requiredTier, children, fallback }: ProGateProps) {
  const t = useTranslations('membership');
  const { tier, isLoading: loading } = useMembership();

  if (loading) return null;

  const userOrder = TIER_ORDER[tier ?? 'FREE'] ?? 0;
  const requiredOrder = TIER_ORDER[requiredTier] ?? 0;

  if (userOrder >= requiredOrder) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const tierNameKey = requiredTier.toLowerCase() as 'plus' | 'pro';

  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
        <IconCrown size={24} className="text-accent" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-text-primary">
        {t(`${tierNameKey}.name`)}
      </h3>
      <p className="mt-1 text-sm text-muted">
        {t(`${tierNameKey}.description`)}
      </p>
      <Link
        href="/pricing"
        className="mt-4 inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
      >
        {t('upgrade')}
      </Link>
    </div>
  );
}
