'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <nav className="relative z-10 flex items-center justify-between">
      <Link href="/" className="text-lg font-bold text-white">
        Notifio
      </Link>
      <Button variant="ghost" size="sm" href="/sign-in" className="text-gray-300 hover:bg-white/10 hover:text-white">
        Sign in
      </Button>
    </nav>
  );
}
