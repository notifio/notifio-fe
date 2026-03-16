import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

interface FooterLink {
  label: string;
  href: string;
}

const FOOTER_LINKS: FooterLink[] = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'About', href: '#' },
  { label: 'Contact', href: '#' },
];

const LANGUAGES = ['SK', 'EN'] as const;

interface FooterNavProps {
  className?: string;
}

function FooterNav({ className }: FooterNavProps) {
  return (
    <nav className={cn('flex items-center gap-6', className)}>
      {FOOTER_LINKS.map((link) => (
        <a
          key={link.label}
          href={link.href}
          className="text-sm text-gray-400 transition-colors hover:text-white"
        >
          {link.label}
        </a>
      ))}
      <span className="text-sm text-gray-600">
        {LANGUAGES.join(' | ')}
      </span>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-[#111827] px-6 py-8 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <Text size="sm" className="text-gray-400">
          &copy; 2026 Notifio
        </Text>
        <FooterNav />
      </div>
    </footer>
  );
}
