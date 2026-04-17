'use client';

import { IconLoader2 } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { PreferenceSection } from '@/components/app/settings/preference-section';
import { Toggle } from '@/components/ui/toggle';
import { useConsents } from '@/hooks/use-consents';

export function PrivacySection() {
  const tc = useTranslations('consent');
  const { consents, isLoading: consentsLoading, updateConsent: apiUpdateConsent } = useConsents();
  const [savingConsent, setSavingConsent] = useState<string | null>(null);

  return (
    <PreferenceSection
      title={tc('settingsTitle')}
      description={tc('settingsDescription')}
    >
      {consentsLoading ? (
        <div className="space-y-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-xl bg-card"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {consents.map((consent) => {
            const code = consent.category.categoryCode;
            const isRequired = consent.category.required;
            const isSaving = savingConsent === code;

            return (
              <div key={code} className="rounded-xl bg-card">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">
                        {tc(`categories.${code}.name`)}
                      </span>
                      {isRequired && (
                        <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-accent">
                          {tc('required')}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {tc(`categories.${code}.desc`)}
                    </p>
                  </div>
                  {isSaving ? (
                    <IconLoader2 size={18} className="shrink-0 animate-spin text-muted" />
                  ) : (
                    <Toggle
                      checked={consent.granted}
                      onChange={async (checked) => {
                        setSavingConsent(code);
                        try {
                          await apiUpdateConsent(code, checked);
                        } finally {
                          setSavingConsent(null);
                        }
                      }}
                      disabled={isRequired}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PreferenceSection>
  );
}
