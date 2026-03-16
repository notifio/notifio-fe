import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useOnboarding } from '../hooks/use-onboarding';
import { OnboardingProvider } from '../providers/onboarding-provider';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { hasCompletedOnboarding } = useOnboarding();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!hasCompletedOnboarding && !inAuthGroup && !inOnboarding) {
      router.replace('/(auth)/welcome');
    } else if (hasCompletedOnboarding && (inAuthGroup || inOnboarding)) {
      router.replace('/(tabs)');
    }
  }, [hasCompletedOnboarding, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <OnboardingProvider>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </SafeAreaProvider>
    </OnboardingProvider>
  );
}
