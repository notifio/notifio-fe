import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DownloadButtonsProps {
  className?: string;
}

const DOWNLOAD_LINKS = [
  { href: '#', label: 'Download for iOS', variant: 'primary' },
  { href: '#', label: 'Download for Android', variant: 'secondary' },
] as const;

export function DownloadButtons({ className }: DownloadButtonsProps) {
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
