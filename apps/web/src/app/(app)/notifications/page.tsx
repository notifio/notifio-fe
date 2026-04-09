'use client';

import { IconBell } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

export default function NotificationsPage() {
  const t = useTranslations('nav');

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-3">
      <IconBell size={40} className="text-muted" />
      <h1 className="text-lg font-semibold text-text-primary">{t('notifications')}</h1>
      <p className="text-sm text-muted">Coming soon</p>
    </div>
  );
}
