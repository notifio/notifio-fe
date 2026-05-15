'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { SocialAuthButtons, type SocialProvider } from '@/components/auth/social-auth-buttons';
import { useToast } from '@/components/ui/toast';
import { createClient } from '@/lib/supabase/client';

export default function SignInPage() {
  const t = useTranslations('auth');
  const toast = useToast();
  const handleSignIn = async (provider: SocialProvider) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Sign-in error:', error);
      toast.error(error.message);
      return;
    }

    // @supabase/ssr's browser client doesn't reliably auto-navigate.
    // Apply data.url explicitly so the OAuth flow actually starts.
    if (data?.url) {
      window.location.href = data.url;
      return;
    }

    // Should never happen — neither error nor URL returned.
    toast.error('Sign in failed');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-8 shadow-sm">
        <div className="text-center">
          <Link
            href="/"
            aria-label="Notifio"
            className="inline-flex items-center justify-center"
          >
            <Image
              src="/logo.png"
              alt="Notifio"
              width={64}
              height={64}
              priority
              className="rounded-2xl"
            />
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-text-primary">{t('signInTo')}</h1>
          <p className="mt-2 text-sm text-muted">{t('getAlerts')}</p>
        </div>

        <div className="mt-8">
          <SocialAuthButtons onAuth={handleSignIn} />
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          {t('privacyNotice')}
        </p>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-muted transition-colors hover:text-text-secondary">
            &larr; {t('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
