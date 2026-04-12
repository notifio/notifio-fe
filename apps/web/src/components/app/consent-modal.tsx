'use client';

import { IconLoader2, IconShieldLock } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import type { ConsentState } from '@notifio/api-client';

import { Toggle } from '@/components/ui/toggle';

interface ConsentModalProps {
  consents: ConsentState[];
  onSave: (decisions: Array<{ categoryCode: string; granted: boolean }>) => Promise<void>;
}

export function ConsentModal({ consents, onSave }: ConsentModalProps) {
  const t = useTranslations('consent');
  const [decisions, setDecisions] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const c of consents) {
      initial[c.category.categoryCode] = c.category.required ? true : c.granted;
    }
    return initial;
  });
  const [saving, setSaving] = useState(false);

  const toggle = useCallback((code: string, value: boolean) => {
    setDecisions((prev) => ({ ...prev, [code]: value }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const items = Object.entries(decisions).map(([categoryCode, granted]) => ({
        categoryCode,
        granted,
      }));
      await onSave(items);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
            <IconShieldLock size={22} className="text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              {t('modalTitle')}
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              {t('modalDescription')}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-1">
          {consents.map((consent) => {
            const code = consent.category.categoryCode;
            const isRequired = consent.category.required;
            const granted = decisions[code] ?? false;

            return (
              <div
                key={code}
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-card"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">
                      {t(`categories.${code}.name`)}
                    </span>
                    {isRequired && (
                      <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-accent">
                        {t('required')}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    {t(`categories.${code}.desc`)}
                  </p>
                </div>
                <Toggle
                  checked={granted}
                  onChange={(v) => toggle(code, v)}
                  disabled={isRequired}
                />
              </div>
            );
          })}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
        >
          {saving && <IconLoader2 size={16} className="animate-spin" />}
          {t('saveButton')}
        </button>
      </div>
    </div>
  );
}
