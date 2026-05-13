import { type ReactNode } from 'react';

import { cn } from '@/lib/utils';

const VARIANT_STYLES = {
  active: 'bg-red-500/10 text-red-500',
  resolved: 'bg-green-500/10 text-green-600',
  upcoming: 'bg-[rgba(58,134,255,0.12)] text-[#3A86FF]',
  community: 'bg-[rgba(139,92,246,0.15)] text-[#8B5CF6]',
} as const;

export type StatusPillVariant = keyof typeof VARIANT_STYLES;

interface StatusPillProps {
  variant: StatusPillVariant;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function StatusPill({ variant, icon, children, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium',
        VARIANT_STYLES[variant],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
