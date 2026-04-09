'use client';

import { useTranslations } from 'next-intl';

import { useSupabaseUser } from '@/hooks/use-supabase-user';

export default function ProfilePage() {
  const t = useTranslations('nav');
  const { name, email } = useSupabaseUser();

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-bold text-white">
        {name?.charAt(0).toUpperCase() ?? '?'}
      </div>
      <div className="text-center">
        <h1 className="text-lg font-semibold text-text-primary">{t('profile')}</h1>
        {name && <p className="mt-1 text-sm text-text-secondary">{name}</p>}
        {email && <p className="text-sm text-muted">{email}</p>}
      </div>
      <p className="text-sm text-muted">Coming soon</p>
    </div>
  );
}
