import { IconMapPin } from '@tabler/icons-react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { OnboardingScreen } from '../../components/ui/onboarding-screen';

export default function LocationScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const goToNotifications = () => router.replace('/onboarding/notifications');

  // PERMS-1: skip the prompt entirely if the user already granted
  // location at the OS level. This handles re-installs or users who
  // sign in on a device where another app already asked.
  useEffect(() => {
    void (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') goToNotifications();
    })();
    // goToNotifications is stable enough for this effect; intentionally
    // empty deps so we only check once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
