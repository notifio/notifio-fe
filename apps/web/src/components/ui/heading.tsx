import { type ReactNode } from 'react';

import { cn } from '@/lib/utils';

const SIZE_STYLES = {
  xl: 'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]',
  lg: 'text-3xl md:text-4xl font-bold tracking-tight leading-[1.15]',
  md: 'text-2xl md:text-3xl font-semibold leading-snug',
  sm: 'text-xl md:text-2xl font-semibold leading-snug',
} as const;

interface HeadingProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  size?: keyof typeof SIZE_STYLES;
  children: ReactNode;
  className?: string;
}

export function Heading({ as: Tag = 'h2', size = 'lg', children, className }: HeadingProps) {
  return <Tag className={cn(SIZE_STYLES[size], className)}>{children}</Tag>;
}
