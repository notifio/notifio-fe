'use client';

import { IconAlertTriangle, IconClock, IconLoader2 } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import type { DigestMode } from '@notifio/api-client';

import { PreferenceSection } from '@/components/app/settings/preference-section';
import { useDigestMode } from '@/hooks/use-digest-mode';

export function DigestSection() {
  const td = useTranslations('digest');
  const { digestMode, loading: digestLoading, saving: digestSaving, updateDigestMode } = useDigestMode();

  return (
    <PreferenceSection
      title={td('title')}
      description={td('description')}
    >
      {digestLoading ? (
        <div className="h-48 animate-pulse rounded-xl bg-card" />
      ) : (
        <>
          <div className="space-y-1">
            {([
              { mode: 'REAL_TIME' as DigestMode, label: td('realTime'), desc: td('realTimeDesc') },
              { mode: 'MORNING' as DigestMode, label: td('morning'), desc: td('morningDesc') },
              { mode: 'EVENING' as DigestMode, label: td('evening'), desc: td('eveningDesc') },
              { mode: 'BOTH' as DigestMode, label: td('both'), desc: td('bothDesc') },
            ]).map(({ mode, label, desc }) => (
              <button
                key={mode}
                onClick={() => updateDigestMode(mode)}
                disabled={digestSaving}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                  digestMode === mode
                    ? 'bg-accent/10 ring-1 ring-accent/30'
                    : 'bg-card hover:bg-card/80'
                } disabled:opacity-60`}
              >
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  digestMode === mode
                    ? 'border-accent bg-accent'
                    : 'border-muted'
                }`}>
                  {digestMode === mode && (
                    digestSaving
                      ? <IconLoader2 size={10} className="animate-spin text-white" />
                      : <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">{label}</span>
                    {mode !== 'REAL_TIME' && <IconClock size={14} className="text-muted" />}
                  </div>
                  <p className="mt-0.5 text-xs text-muted">{desc}</p>
                </div>
              </button>
            ))}
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
