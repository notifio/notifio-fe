'use client';

import { useTranslations } from 'next-intl';
import { type ReactNode, useState } from 'react';

import { cn } from '@/lib/utils';

export type SocialProvider = 'google' | 'apple' | 'facebook';

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.94.46 3.77 1.18 4.93l3.66-2.84Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.365 1.43c0 1.14-.49 2.27-1.29 3.08-.81.82-2.07 1.45-3.13 1.36-.12-1.1.43-2.27 1.18-3.05.82-.84 2.19-1.47 3.24-1.39ZM20.6 17.46c-.55 1.27-.81 1.84-1.51 2.96-.99 1.57-2.39 3.52-4.12 3.54-1.54.02-1.93-1-4.02-1-2.09 0-2.53 1-4.07.98C5.16 23.93 3.84 22.17 2.85 20.6.16 16.4-.13 11.51 1.53 8.92c1.17-1.85 3.02-2.94 4.76-2.94 1.78 0 2.9.98 4.36.98 1.42 0 2.29-.98 4.34-.98 1.56 0 3.2.85 4.39 2.32-3.86 2.12-3.23 7.62 1.22 9.16Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95Z" />
    </svg>
  );
}

interface ProviderDef {
  id: SocialProvider;
  label: string;
  icon: ReactNode;
  className: string;
}

const PROVIDERS: ProviderDef[] = [
  {
    id: 'google',
    label: 'Google',
    icon: <GoogleIcon />,
    className: 'border border-border bg-background text-text-primary hover:bg-card',
  },
  {
    id: 'apple',
    label: 'Apple',
    icon: <AppleIcon />,
    className: 'border border-black bg-black text-white hover:bg-zinc-900',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: <FacebookIcon />,
    className: 'border border-[#1877F2] bg-[#1877F2] text-white hover:bg-[#1565D8]',
  },
];

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin', className)}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface SocialAuthButtonsProps {
  onAuth: (provider: SocialProvider) => void | Promise<void>;
}

export function SocialAuthButtons({ onAuth }: SocialAuthButtonsProps) {
  const t = useTranslations('auth');
  const [pending, setPending] = useState<SocialProvider | null>(null);

  const handle = async (provider: SocialProvider) => {
    if (pending) return;
    setPending(provider);
    try {
      await onAuth(provider);
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {PROVIDERS.map(({ id, label, icon, className }) => {
        const isLoading = pending === id;
        const isOther = pending !== null && pending !== id;
        return (
          <button
            key={id}
            onClick={() => handle(id)}
            disabled={pending !== null}
            className={cn(
              'flex w-full items-center justify-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-opacity',
              className,
              isOther && 'opacity-50',
              isLoading && 'cursor-progress',
            )}
          >
            {isLoading ? <Spinner /> : icon}
            <span>{t('signInWith', { provider: label })}</span>
          </button>
        );
      })}
    </div>
  );
}
