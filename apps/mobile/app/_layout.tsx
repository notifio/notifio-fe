import type { Session } from '@supabase/supabase-js';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { toastConfig } from '../components/ui/toast-config';
import { useAuth } from '../hooks/use-auth';
import { useOnboarding } from '../hooks/use-onboarding';
import { bootstrapLocale } from '../lib/i18n';
import { useReactQueryAppStateBridge } from '../lib/query-app-state';
import { asyncStoragePersister, queryClient } from '../lib/query-client';
import { AuthProvider } from '../providers/auth-provider';
import { ConsentProvider } from '../providers/consent-provider';
import { NotificationProvider } from '../providers/notification-provider';
import { OnboardingProvider } from '../providers/onboarding-provider';
import { ThemeProvider, useIsDark } from '../providers/theme-provider';

SplashScreen.preventAutoHideAsync();

// Apply the user's previously-chosen locale (if any) before the first
// React render writes it back. Fire-and-forget — i18next already has a
// device-detected default queued, so this just swaps it when the
// AsyncStorage read finishes a frame or two later.
void bootstrapLocale();

/**
 * Filip BUG-1 (4.5.2026 audit, Sprint 1 #4): user reported the mobile
 * app prompts login on every cold start while push notifications keep
 * arriving. Race condition source — splash hid as soon as `isReady`
 * (auth + onboarding loaded) flipped, but the routing effect that
 * `router.replace`s into the correct group fires AFTER that. Net result:
 * splash → Expo Router's default Stack screen (often /(auth)/welcome
 * on a fresh navigator) → routing effect kicks in → final screen. User
 * sees a flash of the login screen even though they were authed.
 *
 * Fix: gate `SplashScreen.hideAsync()` on segments-aligned-with-target.
 * We compute which group the user *should* be in given their session
 * and onboarding state, then keep splash visible until `useSegments()`
 * actually returns that group. This way the user only sees the splash
 * → final destination transition, never the auth flash in between.
 */
function isSplashReady(
  isReady: boolean,
  session: Session | null,
  hasCompletedOnboarding: boolean,
  segments: string[],
): boolean {
  if (!isReady) return false;
  const group = segments[0] ?? null;
  if (group === null) return false; // navigator hasn't settled yet

  // No session → must be inside (auth) group
  if (!session) return group === '(auth)';
  // Authed but not onboarded → must be on the onboarding screen
  if (!hasCompletedOnboarding) return group === 'onboarding';
  // Authed + onboarded → any non-auth, non-onboarding group is fine
  // (covers (tabs), settings, events deep-links).
  return group !== '(auth)' && group !== 'onboarding';
}

function RootNavigator() {
  const { session, isLoading: isAuthLoading } = useAuth();
  const { hasCompletedOnboarding, isOnboardingLoaded } = useOnboarding();
  const segments = useSegments();
  const router = useRouter();

  const isReady = !isAuthLoading && isOnboardingLoaded;
  const splashReady = isSplashReady(
    isReady,
    session,
    hasCompletedOnboarding,
    segments as string[],
  );

  useEffect(() => {
    if (splashReady) {
      SplashScreen.hideAsync();
    }
  }, [splashReady]);

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

function AppStateBridge() {
  useReactQueryAppStateBridge();
  return null;
}

export default function RootLayout() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        // Bump this string when shared API contract changes break the
        // cached response shape — RQ then drops the old cache entirely.
        buster: 'v1',
      }}
    >
      <AppStateBridge />
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
    </PersistQueryClientProvider>
  );
}
