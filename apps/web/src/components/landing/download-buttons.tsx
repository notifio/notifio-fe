'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DownloadButtonsProps {
  className?: string;
}

export function DownloadButtons({ className }: DownloadButtonsProps) {
  const t = useTranslations('landing');

  const DOWNLOAD_LINKS = [
    { href: '#', label: t('download.ios'), variant: 'primary' },
    { href: '#', label: t('download.android'), variant: 'secondary' },
  ] as const;

  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      {DOWNLOAD_LINKS.map((link) => (
        <Button
          key={link.label}
          href={link.href}
          variant={link.variant}
          size="lg"
          className={link.variant === 'secondary' ? 'border border-gray-700' : undefined}
        >
          {link.label}
        </Button>
      ))}
    </div>
  );
}
