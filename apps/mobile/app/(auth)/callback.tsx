import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { supabase } from '../../lib/supabase';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

/**
 * Deep-link landing for OAuth web flows (Facebook + Apple-on-Android).
 * The provider redirects to `notifio://auth/callback` after success.
 * `WebBrowser.openAuthSessionAsync` usually resolves the session inline
 * via `setSession`, but this route is a safety net for cases where the
 * browser closes before that completes — checking the Supabase session
 * here decides whether to land on home or back at login.
 *
 * Apple native iOS flow uses `signInWithIdToken` and never reaches here.
 */
export default function AuthCallback() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) {
        router.replace('/');
      } else {
        router.replace('/(auth)/login');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.label, { color: colors.textMuted }]}>
        {t('auth.signingIn', { defaultValue: 'Signing in…' })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.sm,
  },
});
