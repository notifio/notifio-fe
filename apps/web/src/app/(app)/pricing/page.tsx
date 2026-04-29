'use client';

import { IconCheck, IconLoader2 } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { PaymentPlan, PublicMembershipTier } from '@notifio/api-client';

import { useToast } from '@/components/ui/toast';
import { useMembership } from '@/hooks/use-membership';
import { useMembershipTiers } from '@/hooks/use-membership-tiers';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

type BillingCycle = 'monthly' | 'yearly';

const TIER_ORDER: Record<string, number> = { FREE: 0, PLUS: 1, PRO: 2 };
const POPULAR_TIER = 'PRO';

function getPlan(tier: 'PLUS' | 'PRO', billing: BillingCycle): PaymentPlan {
  return `${tier}_${billing.toUpperCase()}` as PaymentPlan;
}

/**
 * BE returns numeric(6,2) prices as strings ("4.99"). Convert to a number
 * for the toFixed(2) display path; treat unparseable values as 0 so a
 * malformed row doesn't break the grid.
 */
function priceFor(tier: PublicMembershipTier, billing: BillingCycle): number {
  const raw = billing === 'monthly' ? tier.priceMonthly : tier.priceYearly;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

export default function PricingPage() {
  const t = useTranslations('membership');
  const { isLoading: loading, tier: currentTier, downgrade } = useMembership();
  const { tiers, isLoading: tiersLoading } = useMembershipTiers();
  const toast = useToast();
  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const [downgrading, setDowngrading] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const handleUpgrade = async (targetTier: 'PLUS' | 'PRO') => {
    setUpgrading(targetTier);
    try {
      // BE now returns `{ sessionId, url }` matching the shared `CheckoutResponse`
      // contract — no cast needed. (Previously BE sent `checkoutUrl`; aligned in
      // notifio-api refactor/be-p2-1-shared-types-dedup.)
      const response = await api.createCheckoutSession({
        plan: getPlan(targetTier, billing),
        successUrl: `${window.location.origin}/checkout/success`,
        cancelUrl: `${window.location.origin}/pricing`,
      });
      if (!response?.url) {
        throw new Error('No checkout URL returned');
      }
      window.location.href = response.url;
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
        {tiersLoading || !tiers ? (
          <div className="col-span-full flex h-48 items-center justify-center">
            <IconLoader2 size={24} className="animate-spin text-muted" />
          </div>
        ) : (
          tiers.map((tierDef) => {
            const isCurrent = currentTier === tierDef.tier;
            const currentOrder = TIER_ORDER[currentTier ?? 'FREE'] ?? 0;
            const tierOrder = TIER_ORDER[tierDef.tier] ?? 0;
            const isUpgrade = tierOrder > currentOrder;
            const isDowngrade = tierOrder < currentOrder;
            const price = priceFor(tierDef, billing);
            const isPopular = tierDef.tier === POPULAR_TIER;
            const tierNameKey = tierDef.tier.toLowerCase() as 'free' | 'plus' | 'pro';

            // Always use i18n features — never raw API codes
            const features: string[] = t.raw(`tiers.${tierDef.tier}.features`) as string[];

            return (
              <div
                key={tierDef.tier}
                className={cn(
                  'relative flex flex-col rounded-2xl border p-6',
                  isPopular
                    ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10'
                    : 'border-border bg-card',
                )}
              >
                {isPopular && (
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
                    onClick={() => handleUpgrade(tierDef.tier as 'PLUS' | 'PRO')}
                    disabled={upgrading !== null}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
                  >
                    {upgrading === tierDef.tier && (
                      <IconLoader2 size={16} className="animate-spin" />
                    )}
                    {t('upgrade')}
                  </button>
                ) : isDowngrade ? (
                  <button
                    onClick={() => handleDowngrade(tierDef.tier as 'FREE' | 'PLUS')}
                    disabled={downgrading !== null}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-text-secondary transition-colors hover:bg-card disabled:opacity-50"
                  >
                    {downgrading === tierDef.tier && (
                      <IconLoader2 size={16} className="animate-spin" />
                    )}
                    {t('downgrade')}
                  </button>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
