'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { EventsSection } from '@/app/(app)/profile/events-section';
import { cn } from '@/lib/utils';

import { HistorySection } from './history-section';
import { RemindersSection } from './reminders-section';

type Tab = 'history' | 'events' | 'reminders';

export default function NotificationsPage() {
  const t = useTranslations('notificationsPage');
  const tNav = useTranslations('nav');
  // TODO: migrate localTabs.hlasenia + localEmpty.* to @notifio/shared
  // in next shared bump and drop the local-namespace overrides in
  // apps/web/messages/*.json. Shared wins on overlap (i18n/request.ts),
  // so once shared has "Hlásenia" the local entry becomes a no-op.
  const tLocalTabs = useTranslations('localTabs');
  const [activeTab, setActiveTab] = useState<Tab>('history');

  // Tab #1 ("history") was previously labeled "História" via
  // notificationsPage.tabs.history. The label now reads "Notifikácie"
  // by repointing only this slot at nav.notifications. Tab #2 ("events")
  // was "Udalosti" via notificationsPage.tabs.events; it now reads
  // "Hlásenia" via the local override (no shared edit possible since
  // shared wins on overlap with notificationsPage.tabs.events).
  const labelFor = (tab: Tab) => {
    if (tab === 'history') return tNav('notifications');
    if (tab === 'events') return tLocalTabs('hlasenia');
    return t(`tabs.${tab}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-8 md:py-10">
      {/* Tab bar */}
      <div className="flex border-b border-border">
        {(['history', 'events', 'reminders'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'relative px-4 pb-3 text-sm font-medium transition-colors',
              activeTab === tab
                ? 'text-accent'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {labelFor(tab)}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-accent" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'history' && <HistorySection />}
      {activeTab === 'events' && (
        <div className="mt-6">
          <EventsSection />
        </div>
      )}
      {activeTab === 'reminders' && <RemindersSection />}
    </div>
  );
}
