'use client';

import { IconAlertTriangle, IconCheck, IconLoader2 } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import type { DigestPreferences } from '@notifio/api-client';

import { PreferenceSection } from '@/components/app/settings/preference-section';
import { useDigestPreferences } from '@/hooks/use-digest-preferences';

type Channel = keyof DigestPreferences;

const CHANNELS: { key: Channel; labelKey: string; descKey: string }[] = [
  { key: 'realTime', labelKey: 'realTime', descKey: 'realTimeDesc' },
  { key: 'morning',  labelKey: 'morning',  descKey: 'morningDesc'  },
  { key: 'evening',  labelKey: 'evening',  descKey: 'eveningDesc'  },
];

export function DigestSection() {
  const td = useTranslations('digest');
  const { prefs, loading, saving, updatePrefs } = useDigestPreferences();

  const toggle = (key: Channel) => {
    const next = { ...prefs, [key]: !prefs[key] };
    const anyActive = Object.values(next).some(Boolean);
    if (!anyActive) return;
    void updatePrefs(next);
  };

  return (
    <PreferenceSection title={td('title')} description={td('description')}>
      {loading ? (
        <div className="h-40 animate-pulse rounded-xl bg-card" />
      ) : (
        <>
          <div className="space-y-1">
            {CHANNELS.map(({ key, labelKey, descKey }) => {
              const active = prefs[key];
              return (
                <button
                  key={key}
                  onClick={() => toggle(key)}
                  disabled={saving}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                    active
                      ? 'bg-accent/10 ring-1 ring-accent/30'
                      : 'bg-card hover:bg-card/80'
                  } disabled:opacity-60`}
                >
                  <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
                    active ? 'border-accent bg-accent' : 'border-muted'
                  }`}>
                    {active && (
                      saving
                        ? <IconLoader2 size={10} className="animate-spin text-white" />
                        : <IconCheck size={12} className="text-white" strokeWidth={3} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-text-primary">{td(labelKey)}</span>
                    <p className="mt-0.5 text-xs text-muted">{td(descKey)}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-warning/20 bg-warning/5 px-4 py-3">
            <IconAlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" />
            <p className="text-xs leading-relaxed text-text-secondary">
              {td('criticalNote')}
            </p>
          </div>
        </>
      )}
    </PreferenceSection>
  );
}
