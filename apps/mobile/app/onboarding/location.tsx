import { IconMapPin } from '@tabler/icons-react-native';
import { useRouter } from 'expo-router';

import { OnboardingScreen } from '../../components/ui/onboarding-screen';

export default function LocationScreen() {
  const router = useRouter();

  const goToNotifications = () => router.push('/onboarding/notifications');

  return (
    <OnboardingScreen
      icon={IconMapPin}
      title="Your location"
      description="We use your location to send you relevant alerts about weather, traffic, and outages near you."
      primaryAction={{ title: 'Allow Location', onPress: goToNotifications }}
      secondaryAction={{ title: 'Skip for now', onPress: goToNotifications }}
    />
  );
}
