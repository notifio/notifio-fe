'use client';

import { useTranslations } from 'next-intl';

import { PreferenceSection } from '@/components/app/settings/preference-section';
import { PushNotificationsToggle } from '@/components/app/settings/push-notifications-toggle';

export function PermissionsSection() {
  const t = useTranslations('settings');

  return (
    <PreferenceSection
      title={t('permissionsTitle')}
      description={t('permissionsDescription')}
    >
      <div className="rounded-xl bg-card p-4">
        <PushNotificationsToggle />
      </div>
    </PreferenceSection>
  );
}
