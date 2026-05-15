import { IconKey } from '@tabler/icons-react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View } from 'react-native';

import { SocialButton } from '../../components/auth/social-button';
import { OnboardingScreen } from '../../components/ui/onboarding-screen';
import { signInWithApple } from '../../lib/apple-auth';
import { signInWithFacebook } from '../../lib/facebook-auth';
import { signInWithGoogle } from '../../lib/google-auth';
import { showToast } from '../../lib/toast';

type Provider = 'google' | 'apple' | 'facebook';

const PROVIDER_FN: Record<Provider, () => Promise<{ error: string | null }>> = {
  google: signInWithGoogle,
  apple: signInWithApple,
  facebook: signInWithFacebook,
};

const PROVIDER_LABEL: Record<Provider, string> = {
  google: 'Google',
  apple: 'Apple',
  facebook: 'Facebook',
};

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [pending, setPending] = useState<Provider | null>(null);
  const isBusy = pending !== null;

  const run = (provider: Provider) => async () => {
    if (isBusy) return;
    setPending(provider);
    try {
      const { error } = await PROVIDER_FN[provider]();
      if (error) {
        showToast.error(t('auth.login.errorTitle', { defaultValue: 'Sign in failed' }), error);
      }
    } catch (err: unknown) {
      const message = (err as { message?: string }).message ?? 'Sign in failed';
      showToast.error(t('auth.login.errorTitle', { defaultValue: 'Sign in failed' }), message);
    } finally {
      setPending(null);
    }
  };

  const signInLabel = (provider: Provider) =>
    t('auth.signInWith', {
      defaultValue: 'Sign in with {{provider}}',
      provider: PROVIDER_LABEL[provider],
    });

  return (
    <OnboardingScreen
      showBrand
      icon={IconKey}
      title={t('auth.login.title')}
      description={t('auth.login.description')}
      secondaryAction={{
        title: t('auth.login.goBack'),
        onPress: () => router.back(),
        disabled: isBusy,
      }}
    >
      <View style={styles.socialStack}>
        {Platform.OS === 'ios' && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={
              AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
            }
            buttonStyle={
              AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={12}
            style={styles.appleNative}
            onPress={run('apple')}
          />
        )}
        <SocialButton
          provider="google"
          label={signInLabel('google')}
          onPress={run('google')}
          loading={pending === 'google'}
          disabled={isBusy && pending !== 'google'}
        />
        <SocialButton
          provider="facebook"
          label={signInLabel('facebook')}
          onPress={run('facebook')}
          loading={pending === 'facebook'}
          disabled={isBusy && pending !== 'facebook'}
        />
        {Platform.OS !== 'ios' && (
          <SocialButton
            provider="apple"
            label={signInLabel('apple')}
            onPress={run('apple')}
            loading={pending === 'apple'}
            disabled={isBusy && pending !== 'apple'}
          />
        )}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  socialStack: {
    width: '100%',
    gap: 10,
  },
  appleNative: {
    width: '100%',
    height: 50,
  },
});
