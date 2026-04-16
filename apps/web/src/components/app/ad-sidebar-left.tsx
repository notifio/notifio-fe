'use client';

import { usePathname } from 'next/navigation';

import { useMembership } from '@/hooks/use-membership';

import { AdPlaceholder } from './ad-placeholder';

export function AdSidebarLeft() {
  const { isFree, isLoading: loading } = useMembership();
  const pathname = usePathname();

  if (loading || !isFree) return null;
  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/map')) return null;

  return (
    <aside className="hidden w-[180px] shrink-0 xl:block">
      <div className="sticky top-[4.5rem] space-y-4 py-6 pl-4">
        <AdPlaceholder variant="card" />
        <AdPlaceholder variant="card" />
      </div>
    </aside>
  );
}
