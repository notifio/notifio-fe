import { IconMapPin } from '@tabler/icons-react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { OnboardingScreen } from '../../components/ui/onboarding-screen';

export default function LocationScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const goToNotifications = () => router.push('/onboarding/notifications');

  const handleAllowLocation = async () => {
    await Location.requestForegroundPermissionsAsync();
    goToNotifications();
  };

  return (
    <OnboardingScreen
      icon={IconMapPin}
      title={t('onboarding.locationTitle')}
      description={t('onboarding.locationDescription')}
      primaryAction={{ title: t('onboarding.allowLocation'), onPress: handleAllowLocation }}
      secondaryAction={{ title: t('onboarding.skipForNow'), onPress: goToNotifications }}
    />
  );
}
