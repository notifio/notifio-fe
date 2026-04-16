'use client';

import { useTranslations } from 'next-intl';

import { PreferenceSection } from '@/components/app/settings/preference-section';
import { PushNotificationsToggle } from '@/components/app/settings/push-notifications-toggle';

export function PushNotificationsSection() {
  const t = useTranslations('settings');

  return (
    <PreferenceSection
      title={t('pushNotifications')}
      description={t('pushDescription')}
    >
      <div className="rounded-xl bg-card p-4">
        <PushNotificationsToggle />
      </div>
    </PreferenceSection>
  );
}
