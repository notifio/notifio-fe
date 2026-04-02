import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { supabase } from './supabase';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

export async function signInWithGoogle(): Promise<{ error: string | null }> {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();

    if (!response.data?.idToken) {
      return { error: 'No ID token received from Google' };
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: response.data.idToken,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };

    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return { error: null };
    }
    if (error.code === statusCodes.IN_PROGRESS) {
      return { error: null };
    }
    if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return { error: 'Google Play Services not available' };
    }

    return { error: error.message ?? 'Unknown error during Google sign-in' };
  }
}
