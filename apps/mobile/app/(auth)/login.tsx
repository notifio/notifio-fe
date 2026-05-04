import { IconKey } from '@tabler/icons-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { OnboardingScreen } from '../../components/ui/onboarding-screen';
import { signInWithGoogle } from '../../lib/google-auth';

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <OnboardingScreen
      showBrand
      icon={IconKey}
      title={t('auth.login.title')}
      description={t('auth.login.description')}
      primaryAction={{
        title: t('auth.login.signIn'),
        onPress: () => {
          if (isLoading) return;
          setIsLoading(true);
          signInWithGoogle()
            .then(({ error }) => {
              if (error) {
                Alert.alert(t('auth.login.errorTitle'), error);
              }
            })
            .finally(() => setIsLoading(false));
        },
      }}
      secondaryAction={{
        title: t('auth.login.goBack'),
        onPress: () => router.back(),
      }}
    />
  );
}
