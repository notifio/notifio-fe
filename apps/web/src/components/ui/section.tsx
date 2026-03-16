import { type ReactNode } from 'react';

import { cn } from '@/lib/utils';

const VARIANT_STYLES = {
  light: 'bg-white text-gray-900',
  dark: 'bg-[#111827] text-white',
  accent: 'bg-gray-50 text-gray-900',
} as const;

interface SectionProps {
  variant?: keyof typeof VARIANT_STYLES;
  className?: string;
  children: ReactNode;
  id?: string;
}

export function Section({ variant = 'light', className, children, id }: SectionProps) {
  return (
    <section id={id} className={cn(VARIANT_STYLES[variant], 'py-20 md:py-28', className)}>
      <div className="mx-auto max-w-7xl px-6 md:px-8">{children}</div>
    </section>
  );
}
