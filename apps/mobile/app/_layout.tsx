import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { toastConfig } from '../components/ui/toast-config';
import { useAuth } from '../hooks/use-auth';
import { useOnboarding } from '../hooks/use-onboarding';
import { AuthProvider } from '../providers/auth-provider';
import { ConsentProvider } from '../providers/consent-provider';
import { NotificationProvider } from '../providers/notification-provider';
import { OnboardingProvider } from '../providers/onboarding-provider';
import { ThemeProvider, useIsDark } from '../providers/theme-provider';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, isLoading: isAuthLoading } = useAuth();
  const { hasCompletedOnboarding, isOnboardingLoaded } = useOnboarding();
  const segments = useSegments();
  const router = useRouter();

  const isReady = !isAuthLoading && isOnboardingLoaded;

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    } else if (session && !hasCompletedOnboarding && !inOnboarding) {
      router.replace('/onboarding');
    } else if (session && hasCompletedOnboarding && (inAuthGroup || inOnboarding)) {
      router.replace('/(tabs)');
    }
  }, [session, isReady, hasCompletedOnboarding, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="events" />
    </Stack>
  );
}

function DynamicStatusBar() {
  const isDark = useIsDark();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <ConsentProvider>
            <NotificationProvider>
              <OnboardingProvider>
                <DynamicStatusBar />
                <RootNavigator />
              </OnboardingProvider>
            </NotificationProvider>
          </ConsentProvider>
        </AuthProvider>
        <Toast config={toastConfig} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
