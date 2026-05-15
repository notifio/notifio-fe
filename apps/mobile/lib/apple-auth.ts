import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

const AUTH_CALLBACK = 'notifio://auth/callback';

export async function signInWithApple(): Promise<{ error: string | null }> {
  if (Platform.OS === 'ios') {
    return signInWithAppleNative();
  }
  return signInWithAppleWeb();
}

async function signInWithAppleNative(): Promise<{ error: string | null }> {
  try {
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      return { error: 'Apple Sign In not available on this device' };
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      return { error: 'Apple returned no identity token' };
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });

    if (error) return { error: error.message };
    return { error: null };
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    // User cancelled the native sheet — suppress so we don't toast.
    if (code === 'ERR_REQUEST_CANCELED') return { error: null };
    const message = (err as { message?: string }).message;
    return { error: message ?? 'Apple Sign In failed' };
  }
}

async function signInWithAppleWeb(): Promise<{ error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
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
    return { error: message ?? 'Apple Sign In failed' };
  }
}
