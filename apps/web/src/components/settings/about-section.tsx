'use client';

import {
  IconChevronDown,
  IconChevronUp,
  IconExternalLink,
  IconHeart,
  IconMail,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { SOURCE_ADAPTERS } from '@notifio/shared';

import { PreferenceSection } from '@/components/app/settings/preference-section';
import { cn } from '@/lib/utils';

const FAQ_KEYS = [
  'noNotifications',
  'planDifference',
  'addLocation',
  'digestModes',
  'muteLocation',
  'communityReliability',
  'cancelSubscription',
  'deleteAccount',
] as const;

// TODO: pipe from CI via NEXT_PUBLIC_APP_VERSION once injection is set up.
const APP_VERSION = '0.1.0';

export function AboutSection() {
  const tSettings = useTranslations('settings');
  const tAbout = useTranslations('about');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const sourceNames = Object.values(SOURCE_ADAPTERS)
    .map((s) => s.name)
    .sort((a, b) => a.localeCompare(b))
    .join(' · ');

  return (
    <PreferenceSection
      title={tSettings('about')}
      description={tAbout('description')}
    >
      <div className="space-y-6 rounded-xl bg-card p-4">
        {/* FAQ */}
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            {tAbout('faq.section')}
          </div>
          <div className="space-y-1">
            {FAQ_KEYS.map((key) => {
              const isExpanded = expandedFaq === key;
              return (
                <div
                  key={key}
                  className={cn(
                    'rounded-lg border bg-background transition-colors',
                    isExpanded ? 'border-accent/30' : 'border-border',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isExpanded ? null : key)}
                    aria-expanded={isExpanded}
                    className="flex w-full items-center justify-between p-3 text-left"
                  >
                    <span className="pr-2 text-sm font-medium text-text-primary">
                      {tAbout(`faq.items.${key}.q`)}
                    </span>
                    {isExpanded ? (
                      <IconChevronUp size={16} className="shrink-0 text-accent" />
                    ) : (
                      <IconChevronDown size={16} className="shrink-0 text-muted" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 text-xs leading-relaxed text-text-secondary">
                      {tAbout(`faq.items.${key}.a`)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact */}
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            {tAbout('support.section')}
          </div>
          <a
            href="mailto:support@notifio.sk"
            className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 transition hover:border-accent/30"
          >
            <IconMail size={18} className="shrink-0 text-accent" />
            <div className="min-w-0 flex-1">
              <div className="text-sm text-text-primary">support@notifio.sk</div>
              <div className="mt-0.5 text-xs text-muted">
                {tAbout('support.responseTime')}
              </div>
            </div>
            <IconExternalLink size={14} className="shrink-0 text-muted" />
          </a>
        </div>

        {/* Legal */}
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            {tAbout('legal.section')}
          </div>
          <div className="space-y-1">
            <a
              href="https://notifio.sk/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg border border-border bg-background p-3 transition hover:border-accent/30"
            >
              <span className="text-sm text-text-primary">{tAbout('legal.privacy')}</span>
              <IconExternalLink size={14} className="text-muted" />
            </a>
            <a
              href="https://notifio.sk/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg border border-border bg-background p-3 transition hover:border-accent/30"
            >
              <span className="text-sm text-text-primary">{tAbout('legal.terms')}</span>
              <IconExternalLink size={14} className="text-muted" />
            </a>
          </div>
        </div>

        {/* Providers */}
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            {tAbout('providers.section')}
          </div>
          <div className="text-xs leading-relaxed text-text-secondary">
            {tAbout('providers.description')}
          </div>
          <div className="mt-2 text-xs leading-relaxed text-text-secondary">
            {sourceNames}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border pt-3 text-center text-xs text-muted">
          Notifio v{APP_VERSION} · {tAbout('madeIn.before')}{' '}
          <IconHeart
            size={11}
            className="inline-block align-middle text-danger"
            aria-hidden="true"
          />{' '}
          {tAbout('madeIn.after')}
        </div>
      </div>
    </PreferenceSection>
  );
}
