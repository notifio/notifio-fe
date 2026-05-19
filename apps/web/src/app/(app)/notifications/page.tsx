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
  const [activeTab, setActiveTab] = useState<Tab>('history');

  // Tab #1 ("history") was previously labeled "História" via
  // notificationsPage.tabs.history. The label now reads "Notifikácie"
  // by repointing only this slot at nav.notifications — same Slovak
  // string in all 6 locales, no shared edit. Page h1 is dropped to
  // avoid the duplicate-label conflict with the renamed tab.
  const labelFor = (tab: Tab) =>
    tab === 'history' ? tNav('notifications') : t(`tabs.${tab}`);

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
