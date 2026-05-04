import { IconBroadcast } from '@tabler/icons-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { OnboardingScreen } from '../../components/ui/onboarding-screen';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <OnboardingScreen
      showBrand
      icon={IconBroadcast}
      title={t('auth.welcome.title')}
      description={t('auth.welcome.description')}
      primaryAction={{ title: t('auth.welcome.getStarted'), onPress: () => router.push('/(auth)/login') }}
      secondaryAction={{ title: t('auth.welcome.alreadyHaveAccount'), onPress: () => router.push('/(auth)/login') }}
    />
  );
}
