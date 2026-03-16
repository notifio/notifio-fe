import { useRouter } from 'expo-router';
import { Radio } from 'lucide-react-native';

import { OnboardingScreen } from '../../components/ui/onboarding-screen';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <OnboardingScreen
      icon={Radio}
      title="Welcome to Notifio"
      description="Real-time alerts for your area — weather, traffic, outages, and more."
      primaryAction={{ title: 'Get Started', onPress: () => router.push('/onboarding/location') }}
      secondaryAction={{ title: 'I already have an account', onPress: () => router.push('/(auth)/login') }}
    />
  );
}
