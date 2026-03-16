import { type ReactNode } from 'react';

import { cn } from '@/lib/utils';

const VARIANT_STYLES = {
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',
  default: 'bg-gray-100 text-gray-700',
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
