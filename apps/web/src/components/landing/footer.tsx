'use client';

import { useTranslations } from 'next-intl';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

interface FooterNavProps {
  className?: string;
}

function FooterNav({ className }: FooterNavProps) {
  const t = useTranslations('landing');

  const FOOTER_LINKS = [
    { label: t('footer.privacy'), href: '#' },
    { label: t('footer.about'), href: '#' },
    { label: t('footer.contact'), href: '#' },
  ];

  return (
    <nav className={cn('flex items-center gap-6', className)}>
      {FOOTER_LINKS.map((link) => (
        <a
          key={link.label}
          href={link.href}
          className="text-sm text-white/50 transition-colors hover:text-white"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}

export function Footer() {
  const t = useTranslations('landing');
  return (
    <footer className="border-t border-gray-800 bg-[#111827] px-6 py-8 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <Text size="sm" className="text-white/50">
          {t('footer.copyright')}
        </Text>
        <FooterNav />
      </div>
    </footer>
  );
}
