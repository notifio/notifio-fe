import { IconMapPin } from '@tabler/icons-react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

import { OnboardingScreen } from '../../components/ui/onboarding-screen';

export default function LocationScreen() {
  const router = useRouter();

  const goToNotifications = () => router.push('/onboarding/notifications');

  const handleAllowLocation = async () => {
    await Location.requestForegroundPermissionsAsync();
    goToNotifications();
  };

  return (
    <OnboardingScreen
      icon={IconMapPin}
      title="Your location"
      description="We use your location to send you relevant alerts about weather, traffic, and outages near you."
      primaryAction={{ title: 'Allow Location', onPress: handleAllowLocation }}
      secondaryAction={{ title: 'Skip for now', onPress: goToNotifications }}
    />
  );
}
