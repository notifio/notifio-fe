'use client';

import { IconCheck, IconLoader2 } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { PaymentPlan } from '@notifio/api-client';

import { useToast } from '@/components/ui/toast';
import { useMembership } from '@/hooks/use-membership';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

type BillingCycle = 'monthly' | 'yearly';

interface TierDef {
  key: 'FREE' | 'PLUS' | 'PRO';
  priceMonthly: number;
  priceYearly: number;
  popular?: boolean;
}

const TIERS: TierDef[] = [
  { key: 'FREE', priceMonthly: 0, priceYearly: 0 },
  { key: 'PLUS', priceMonthly: 2.99, priceYearly: 29.99 },
  { key: 'PRO', priceMonthly: 5.99, priceYearly: 59.99, popular: true },
];

const TIER_ORDER: Record<string, number> = { FREE: 0, PLUS: 1, PRO: 2 };

function getPlan(tier: 'PLUS' | 'PRO', billing: BillingCycle): PaymentPlan {
  return `${tier}_${billing.toUpperCase()}` as PaymentPlan;
}

export default function PricingPage() {
  const t = useTranslations('membership');
  const { isLoading: loading, tier: currentTier, downgrade } = useMembership();
  const toast = useToast();
  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const [downgrading, setDowngrading] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const handleUpgrade = async (targetTier: 'PLUS' | 'PRO') => {
    setUpgrading(targetTier);
    try {
      // API returns { checkoutUrl, sessionId } — @notifio/shared types this as `url`,
      // but the actual field is `checkoutUrl`. Cast until shared is updated.
      const response = await api.createCheckoutSession({
        plan: getPlan(targetTier, billing),
        successUrl: `${window.location.origin}/checkout/success`,
        cancelUrl: `${window.location.origin}/pricing`,
      }) as unknown as { sessionId: string; checkoutUrl: string };
      if (!response?.checkoutUrl) {
        throw new Error('No checkout URL returned');
      }
      window.location.href = response.checkoutUrl;
    } catch {
      toast.error(t('checkoutError'));
      setUpgrading(null);
    }
  };

  const handleDowngrade = async (targetTier: 'FREE' | 'PLUS') => {
    setDowngrading(targetTier);
    try {
      await downgrade(targetTier);
    } finally {
      setDowngrading(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8 md:py-14">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-text-primary">{t('pricing')}</h1>
      </div>

      {/* Billing toggle */}
      <div className="mt-8 flex items-center justify-center gap-1 rounded-full bg-card p-1">
        <button
          onClick={() => setBilling('monthly')}
          className={cn(
            'rounded-full px-5 py-2 text-sm font-medium transition-colors',
            billing === 'monthly'
              ? 'bg-accent text-white'
              : 'text-text-secondary hover:text-text-primary',
          )}
        >
          {t('monthly')}
        </button>
        <button
          onClick={() => setBilling('yearly')}
          className={cn(
            'rounded-full px-5 py-2 text-sm font-medium transition-colors',
            billing === 'yearly'
              ? 'bg-accent text-white'
              : 'text-text-secondary hover:text-text-primary',
          )}
        >
          {t('yearly')}
        </button>
      </div>

      {/* Tier cards — equal height via items-stretch */}
      <div className="mt-10 grid items-stretch gap-6 md:grid-cols-3">
        {TIERS.map((tierDef) => {
          const isCurrent = currentTier === tierDef.key;
          const currentOrder = TIER_ORDER[currentTier ?? 'FREE'] ?? 0;
          const tierOrder = TIER_ORDER[tierDef.key] ?? 0;
          const isUpgrade = tierOrder > currentOrder;
          const isDowngrade = tierOrder < currentOrder;
          const price = billing === 'monthly' ? tierDef.priceMonthly : tierDef.priceYearly;
          const tierNameKey = tierDef.key.toLowerCase() as 'free' | 'plus' | 'pro';

          // Always use i18n features — never raw API codes
          const features: string[] = t.raw(`tiers.${tierDef.key}.features`) as string[];

          return (
            <div
              key={tierDef.key}
              className={cn(
                'relative flex flex-col rounded-2xl border p-6',
                tierDef.popular
                  ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10'
                  : 'border-border bg-card',
              )}
            >
              {tierDef.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-semibold text-white">
                  {t('popular')}
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-bold text-text-primary">
                  {t(`${tierNameKey}.name`)}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {t(`${tierNameKey}.description`)}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-text-primary">
                  {price === 0 ? '€0' : `€${price.toFixed(2)}`}
                </span>
                <span className="text-sm text-muted">
                  {billing === 'monthly' ? t('perMonth') : t('perYear')}
                </span>
              </div>

              <div className="mb-6 flex-1">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                  {t('features')}
                </p>
                <ul className="space-y-2.5">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-text-secondary">
                      <IconCheck size={16} className="mt-0.5 shrink-0 text-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              {loading ? (
                <div className="flex h-11 items-center justify-center rounded-xl bg-card">
                  <IconLoader2 size={18} className="animate-spin text-muted" />
                </div>
              ) : isCurrent ? (
                <div className="flex h-11 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-sm font-medium text-accent">
                  {t('currentPlan')}
                </div>
              ) : isUpgrade ? (
                <button
                  onClick={() => handleUpgrade(tierDef.key as 'PLUS' | 'PRO')}
                  disabled={upgrading !== null}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
                >
                  {upgrading === tierDef.key && (
                    <IconLoader2 size={16} className="animate-spin" />
                  )}
                  {t('upgrade')}
                </button>
              ) : isDowngrade ? (
                <button
                  onClick={() => handleDowngrade(tierDef.key as 'FREE' | 'PLUS')}
                  disabled={downgrading !== null}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-text-secondary transition-colors hover:bg-card disabled:opacity-50"
                >
                  {downgrading === tierDef.key && (
                    <IconLoader2 size={16} className="animate-spin" />
                  )}
                  {t('downgrade')}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
