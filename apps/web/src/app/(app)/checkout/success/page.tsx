'use client';

import { IconCheck, IconLoader2 } from '@tabler/icons-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import type { MembershipResponse } from '@/hooks/use-membership';
import { api } from '@/lib/api';

const MAX_POLLS = 5;
const POLL_INTERVAL_MS = 3000;

export default function CheckoutSuccessPage() {
  const t = useTranslations('membership');
  const [membership, setMembership] = useState<MembershipResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMembership = useCallback(async () => {
    const data = await api.getMembership();
    return data as unknown as MembershipResponse;
  }, []);

  useEffect(() => {
    let cancelled = false;
    let pollCount = 0;

    async function poll() {
      try {
        const data = await fetchMembership();
        if (cancelled) return;

        if (data.current.tier !== 'FREE' || pollCount >= MAX_POLLS - 1) {
          setMembership(data);
          setLoading(false);
          return;
        }

        pollCount++;
        setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (!cancelled) setLoading(false);
      }
    }

    poll();
    return () => { cancelled = true; };
  }, [fetchMembership]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <IconLoader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  const tier = membership?.current.tier ?? 'FREE';
  const tierName = membership?.current.name ?? tier;
  const features = membership?.current.features ?? [];
  const isPro = tier === 'PRO';

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center md:py-24">
      {/* Green checkmark */}
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
        <IconCheck size={32} className="text-green-500" />
      </div>

      <h1 className="mt-6 text-2xl font-bold text-text-primary">
        {t('checkout.successTitle', { tier: tierName })}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {t('checkout.successSubtitle')}
      </p>

      {isPro && (
        <p className="mt-2 text-sm text-accent">
          {t('checkout.trialStarted')}
        </p>
      )}

      {/* Unlocked features */}
      {features.length > 0 && (
        <div className="mt-8 border-t border-border pt-6 text-left">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            {t('checkout.unlocked')}
          </p>
          <ul className="space-y-2">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-text-secondary">
                <IconCheck size={16} className="mt-0.5 shrink-0 text-accent" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      <Link
        href="/dashboard"
        className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-accent px-8 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
      >
        {t('checkout.goToDashboard')}
      </Link>

      <p className="mt-3 text-xs text-muted">
        {t('checkout.manageInSettings')}
      </p>
    </div>
  );
}
