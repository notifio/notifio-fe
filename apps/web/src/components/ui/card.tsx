import { type ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-background',
        hover && 'transition-shadow duration-200 hover:shadow-lg',
        className
      )}
    >
      {children}
    </div>
  );
}
