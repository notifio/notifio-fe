'use client';

import { IconCheck, IconClock, IconLoader2, IconRefresh } from '@tabler/icons-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import type { MembershipResponse } from '@/hooks/use-membership';
import { api } from '@/lib/api';

const MAX_POLLS = 20;
const POLL_INTERVAL_MS = 3000;

type SuccessState = 'polling' | 'success' | 'processing' | 'error';

export default function CheckoutSuccessPage() {
  const t = useTranslations('membership');
  const [membership, setMembership] = useState<MembershipResponse | null>(null);
  const [state, setState] = useState<SuccessState>('polling');
  const [pollTrigger, setPollTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let pollCount = 0;

    async function poll() {
      if (cancelled) return;

      try {
        const data = await api.getMembership() as unknown as MembershipResponse;
        if (cancelled) return;

        if (data.current.tier !== 'FREE') {
          setMembership(data);
          setState('success');
          return;
        }

        pollCount++;
        if (pollCount >= MAX_POLLS) {
          setMembership(data);
          setState('processing');
          return;
        }

        setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (!cancelled) setState('error');
      }
    }

    setState('polling');
    poll();
    return () => { cancelled = true; };
  }, [pollTrigger]);

  const handleRefresh = () => {
    setPollTrigger((n) => n + 1);
  };

  // Polling state — spinner
  if (state === 'polling') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <IconLoader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  // Error state
  if (state === 'error') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center md:py-24">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
          <IconRefresh size={32} className="text-danger" />
        </div>
        <p className="mt-6 text-sm text-muted">{t('checkoutError')}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
        >
          <IconRefresh size={16} />
          {t('checkout.refresh')}
        </button>
      </div>
    );
  }

  // Processing state — webhook hasn't fired yet
  if (state === 'processing') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center md:py-24">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
          <IconClock size={32} className="text-amber-500" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-text-primary">
          {t('checkout.processingTitle')}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {t('checkout.processingSubtitle')}
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
          >
            <IconRefresh size={16} />
            {t('checkout.refresh')}
          </button>
          <Link
            href="/dashboard"
            className="text-sm text-muted transition-colors hover:text-text-primary"
          >
            {t('checkout.goToDashboard')}
          </Link>
        </div>
      </div>
    );
  }

  // Success state — tier updated
  const tier = membership?.current.tier ?? 'FREE';
  const tierName = membership?.current.name ?? tier;
  const features = membership?.current.features ?? [];
  const isPro = tier === 'PRO';

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center md:py-24">
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
