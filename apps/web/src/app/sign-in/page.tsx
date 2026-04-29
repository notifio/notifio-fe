'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { SocialAuthButtons } from '@/components/auth/social-auth-buttons';
import { Logo } from '@/components/ui/logo';
import { createClient } from '@/lib/supabase/client';

export default function SignInPage() {
  const t = useTranslations('auth');
  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error('Sign-in error:', error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-8 shadow-sm">
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 text-xl font-bold text-accent"
          >
            <Logo size={36} flat title="" />
            <span>Notifio</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-text-primary">{t('signInTo')}</h1>
          <p className="mt-2 text-sm text-muted">{t('getAlerts')}</p>
        </div>

        <div className="mt-8">
          <SocialAuthButtons onAuth={handleGoogleSignIn} />
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
