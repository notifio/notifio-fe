import { KeyRound } from 'lucide-react-native';

import { OnboardingScreen } from '../../components/ui/onboarding-screen';

export default function LoginScreen() {
  return (
    <OnboardingScreen
      icon={KeyRound}
      title="Welcome back"
      description="Sign in to your Notifio account to continue."
      primaryAction={{ title: 'Sign In', onPress: () => {} }} // TODO: implement
      secondaryAction={{ title: 'Go back', onPress: () => {} }} // TODO: implement
    />
  );
}
