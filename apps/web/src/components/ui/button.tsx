import { type ComponentPropsWithoutRef } from 'react';

import { cn } from '@/lib/utils';

const VARIANT_STYLES = {
  primary: 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:bg-[#1E40AF]',
  secondary: 'bg-[#1E293B] text-white hover:bg-[#334155] active:bg-[#0F172A]',
  ghost: 'bg-transparent text-current hover:bg-gray-100 active:bg-gray-200',
  outline: 'border border-gray-300 bg-transparent text-current hover:bg-gray-50 active:bg-gray-100',
} as const;

const SIZE_STYLES = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-5 py-2.5 text-base rounded-lg',
  lg: 'px-7 py-3.5 text-lg rounded-lg',
} as const;

type ButtonVariant = keyof typeof VARIANT_STYLES;
type ButtonSize = keyof typeof SIZE_STYLES;

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

type ButtonAsButton = ButtonBaseProps &
  Omit<ComponentPropsWithoutRef<'button'>, keyof ButtonBaseProps> & {
    href?: never;
  };

type ButtonAsAnchor = ButtonBaseProps &
  Omit<ComponentPropsWithoutRef<'a'>, keyof ButtonBaseProps> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsAnchor;

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] disabled:pointer-events-none disabled:opacity-50',
    VARIANT_STYLES[variant],
    SIZE_STYLES[size],
    className
  );

  if ('href' in props && props.href != null) {
    const { href, ...rest } = props;
    return <a href={href} className={classes} {...rest} />;
  }

  const { ...rest } = props as Omit<ComponentPropsWithoutRef<'button'>, keyof ButtonBaseProps>;
  return <button className={classes} {...rest} />;
}
