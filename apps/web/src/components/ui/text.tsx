import { type ReactNode } from 'react';

import { cn } from '@/lib/utils';

const SIZE_STYLES = {
  lg: 'text-lg md:text-xl leading-relaxed',
  md: 'text-base md:text-lg leading-relaxed',
  sm: 'text-sm md:text-base leading-normal',
} as const;

interface TextProps {
  size?: keyof typeof SIZE_STYLES;
  muted?: boolean;
  children: ReactNode;
  className?: string;
}

export function Text({ size = 'md', muted = false, children, className }: TextProps) {
  return (
    <p className={cn(SIZE_STYLES[size], muted && 'text-gray-500', className)}>{children}</p>
  );
}
