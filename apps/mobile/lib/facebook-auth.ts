import * as WebBrowser from 'expo-web-browser';

import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

const AUTH_CALLBACK = 'notifio://auth/callback';

export async function signInWithFacebook(): Promise<{ error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: AUTH_CALLBACK,
        skipBrowserRedirect: true,
      },
    });

    if (error) return { error: error.message };
    if (!data.url) return { error: 'No OAuth URL returned' };

    const result = await WebBrowser.openAuthSessionAsync(data.url, AUTH_CALLBACK);

    if (result.type === 'cancel' || result.type === 'dismiss') {
      return { error: null };
    }

    if (result.type === 'success' && result.url) {
      const parsed = new URL(result.url);
      const params = new URLSearchParams(
        parsed.hash.startsWith('#') ? parsed.hash.slice(1) : parsed.search,
      );
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) return { error: sessionError.message };
      }
    }

    return { error: null };
  } catch (err: unknown) {
    const message = (err as { message?: string }).message;
    return { error: message ?? 'Facebook Sign In failed' };
  }
}
