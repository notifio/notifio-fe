'use client';

import Link from 'next/link';

import { SocialAuthButtons } from '@/components/auth/social-auth-buttons';
import { createClient } from '@/lib/supabase/client';

export default function SignInPage() {
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <Link href="/" className="text-xl font-bold text-[#2563EB]">
            Notifio
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Sign in to Notifio</h1>
          <p className="mt-2 text-sm text-gray-500">Get alerts for your area</p>
        </div>

        <div className="mt-8">
          <SocialAuthButtons onAuth={handleGoogleSignIn} />
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          By continuing, you agree to our{' '}
          <a href="#" className="underline hover:text-gray-600">
            Privacy Policy
          </a>
        </p>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-400 transition-colors hover:text-gray-600">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
