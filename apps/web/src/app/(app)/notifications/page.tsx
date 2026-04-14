'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import { HistorySection } from './history-section';
import { RemindersSection } from './reminders-section';

type Tab = 'history' | 'reminders';

export default function NotificationsPage() {
  const t = useTranslations('notificationsPage');
  const [activeTab, setActiveTab] = useState<Tab>('history');

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-8 md:py-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>
      </div>

      {/* Tab bar */}
      <div className="mt-6 flex border-b border-border">
        {(['history', 'reminders'] as const).map((tab) => (
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
            {t(`tabs.${tab}`)}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-accent" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'history' && <HistorySection />}
      {activeTab === 'reminders' && <RemindersSection />}
    </div>
  );
}
