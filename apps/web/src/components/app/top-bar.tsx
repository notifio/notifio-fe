'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Settings', href: '/settings' },
] as const;

export function TopBar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const initial = user?.name.charAt(0).toUpperCase() ?? '?';

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center border-b border-gray-100 bg-white px-6">
      <Link href="/dashboard" className="text-lg font-bold text-[#2563EB]">
        Notifio
      </Link>

      <nav className="ml-8 flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#EFF6FF] text-[#2563EB]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-sm font-medium text-white">
            {initial}
          </div>
          <span className="hidden text-sm font-medium text-gray-700 md:inline">
            {user?.name}
          </span>
        </div>
        <button
          onClick={signOut}
          className="hidden rounded-md px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 sm:inline-flex"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
