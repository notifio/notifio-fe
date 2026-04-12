'use client';

import { IconCreditCard, IconLoader2 } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type FormEvent, useState } from 'react';

import { api } from '@/lib/api';

interface PaymentFormProps {
  targetTier: 'PLUS' | 'PRO';
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

export function PaymentForm({ targetTier }: PaymentFormProps) {
  const t = useTranslations('membership.checkout');
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardDigits = cardNumber.replace(/\D/g, '');
  const expiryDigits = expiry.replace(/\D/g, '');
  const cvcDigits = cvc.replace(/\D/g, '');

  const isValid =
    cardDigits.length === 16 &&
    expiryDigits.length === 4 &&
    Number(expiryDigits.slice(0, 2)) >= 1 &&
    Number(expiryDigits.slice(0, 2)) <= 12 &&
    cvcDigits.length >= 3 &&
    cvcDigits.length <= 4;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid || processing) return;

    setProcessing(true);
    setError(null);

    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await api.upgradeMembership({ targetTier });
      router.push('/dashboard?upgraded=' + targetTier);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Payment failed';
      setError(msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Test mode banner */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-center text-xs font-medium text-amber-600 dark:text-amber-400">
        {t('testMode')}
      </div>

      {/* Card number */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">
          {t('cardNumber')}
        </label>
        <div className="relative">
          <IconCreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            inputMode="numeric"
            placeholder="4242 4242 4242 4242"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {/* Expiry + CVC */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            {t('expiry')}
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="12/28"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            {t('cvc')}
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="123"
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!isValid || processing}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
      >
        {processing && <IconLoader2 size={18} className="animate-spin" />}
        {processing ? t('processing') : t('payButton')}
      </button>
    </form>
  );
}
