'use client';

import { IconCheck } from '@tabler/icons-react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { PaymentForm } from '@/components/app/checkout/payment-form';

interface TierInfo {
  priceMonthly: number;
  priceYearly: number;
  features: string[];
}

const TIER_INFO: Record<string, TierInfo> = {
  PLUS: {
    priceMonthly: 2.99,
    priceYearly: 29.99,
    features: [
      '5 saved locations',
      'All Free features',
      'Ad-free experience',
      'Priority notifications',
      'Custom alert sounds',
    ],
  },
  PRO: {
    priceMonthly: 5.99,
    priceYearly: 59.99,
    features: [
      '15 saved locations',
      'All Plus features',
      'Personal reminders',
      'Weather thresholds',
      'Source preferences',
      'API access',
    ],
  },
};

export default function CheckoutPage() {
  const t = useTranslations('membership');
  const tc = useTranslations('membership.checkout');
  const searchParams = useSearchParams();

  const tierParam = searchParams.get('tier')?.toUpperCase();
  const billingParam = searchParams.get('billing') ?? 'monthly';

  const targetTier = tierParam === 'PLUS' || tierParam === 'PRO' ? tierParam : 'PLUS';
  const billing = billingParam === 'yearly' ? 'yearly' : 'monthly';
  const info = TIER_INFO[targetTier]!;
  const price = billing === 'monthly' ? info.priceMonthly : info.priceYearly;
  const tierNameKey = targetTier.toLowerCase() as 'plus' | 'pro';

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-14">
      <h1 className="text-2xl font-bold text-text-primary">{tc('title')}</h1>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {/* Left — Plan summary */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            {tc('summary')}
          </p>
          <h2 className="mt-3 text-xl font-bold text-text-primary">
            {t(`${tierNameKey}.name`)}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {t(`${tierNameKey}.description`)}
          </p>

          <div className="mt-4 border-t border-border pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-text-secondary">
                {billing === 'monthly' ? t('monthly') : t('yearly')}
              </span>
              <span className="text-2xl font-bold text-text-primary">
                €{price.toFixed(2)}
              </span>
            </div>
            <p className="mt-0.5 text-right text-xs text-muted">
              {billing === 'monthly' ? t('perMonth') : t('perYear')}
            </p>
          </div>

          <div className="mt-5 border-t border-border pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
              {t('features')}
            </p>
            <ul className="space-y-2">
              {info.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-text-secondary">
                  <IconCheck size={16} className="mt-0.5 shrink-0 text-accent" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right — Payment form */}
        <div>
          <PaymentForm targetTier={targetTier} />
        </div>
      </div>
    </div>
  );
}
