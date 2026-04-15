'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { useMembership } from '@/hooks/use-membership';
import { useSupabaseUser } from '@/hooks/use-supabase-user';

import { AccountSection } from './account-section';
import { EventsSection } from './events-section';
import { LocationsSection } from './locations-section';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const { name, email, avatar, user } = useSupabaseUser();
  const { tier } = useMembership();

  const initial = name?.charAt(0).toUpperCase() ?? '?';
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
      })
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-8 md:py-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        {avatar ? (
          <img
            src={avatar}
            alt=""
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-bold text-white">
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-text-primary">{name}</h1>
            {tier && (
              <Link
                href="/pricing"
                className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
              >
                {tier}
              </Link>
            )}
          </div>
          {email && (
            <p className="mt-0.5 text-sm text-muted">{email}</p>
          )}
          {createdAt && (
            <p className="mt-0.5 text-xs text-muted">
              {t('memberSince', { date: createdAt })}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-8">
        <LocationsSection />
        <EventsSection />
        <AccountSection />
      </div>
    </div>
  );
}
