import { useRouter } from 'expo-router';
import { KeyRound } from 'lucide-react-native';
import { useState } from 'react';
import { Alert } from 'react-native';

import { OnboardingScreen } from '../../components/ui/onboarding-screen';
import { signInWithGoogle } from '../../lib/google-auth';

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  return (
    <OnboardingScreen
      icon={KeyRound}
      title="Welcome back"
      description="Sign in to your Notifio account to continue."
      primaryAction={{
        title: 'Sign In',
        onPress: () => {
          if (isLoading) return;
          setIsLoading(true);
          signInWithGoogle()
            .then(({ error }) => {
              if (error) {
                Alert.alert('Sign In Error', error);
              }
            })
            .finally(() => setIsLoading(false));
        },
      }}
      secondaryAction={{
        title: 'Go back',
        onPress: () => router.back(),
      }}
    />
  );
}
