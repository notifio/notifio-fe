import { type ReactNode } from 'react';

import { cn } from '@/lib/utils';

const VARIANT_STYLES = {
  info: 'bg-info/15 text-info',
  warning: 'bg-amber-100 text-amber-700',
  critical: 'bg-danger/15 text-danger',
  default: 'bg-card text-text-secondary',
} as const;

interface BadgeProps {
  variant?: keyof typeof VARIANT_STYLES;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        VARIANT_STYLES[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
