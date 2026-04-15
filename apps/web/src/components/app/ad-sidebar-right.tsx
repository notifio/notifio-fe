'use client';

import { usePathname } from 'next/navigation';

import { useMembership } from '@/hooks/use-membership';

import { UpsellCard } from './upsell-card';

export function AdSidebarRight() {
  const { isFree, loading } = useMembership();
  const pathname = usePathname();

  if (loading || !isFree) return null;
  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/map')) return null;

  return (
    <aside className="hidden w-[180px] shrink-0 xl:block">
      <div className="sticky top-[4.5rem] space-y-4 py-6 pr-4">
        <UpsellCard variant="sidebar" />
      </div>
    </aside>
  );
}
