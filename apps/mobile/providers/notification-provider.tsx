import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '../hooks/use-auth';
import { useGeolocationTracker } from '../hooks/use-geolocation-tracker';
import { api } from '../lib/api';
import {
  autoSaveLocationIfNeeded,
  configureForegroundNotifications,
  deactivateDevice,
  getFcmToken,
  refreshToken,
  registerDeviceWithBackend,
  requestPermissions,
  setupBackgroundMessageHandler,
  setupTokenRefreshListener,
} from '../services/push-notifications';

export interface NotificationContextValue {
  hasPermission: boolean;
  isRegistered: boolean;
  requestPermission: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextValue | null>(null);

// Must be called at module level (outside component) for background delivery
setupBackgroundMessageHandler();

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const isAuthenticated = !!session;
  const prevAuthRef = useRef(isAuthenticated);

  // Track GPS in foreground when device is registered
  useGeolocationTracker(isRegistered);

  // Configure how foreground notifications are displayed
  useEffect(() => {
    configureForegroundNotifications();
  }, []);

  // Handle notification tap → deep link
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const deepLink = response.notification.request.content.data?.deepLink;
        if (typeof deepLink === 'string') {
          router.push(deepLink);
        }
      },
    );
    return () => subscription.remove();
  }, [router]);

  const requestPermission = useCallback(async () => {
    const granted = await requestPermissions();
    setHasPermission(granted);
  }, []);

  // Sync alert type selections saved during onboarding
  const syncOnboardingPreferences = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem('onboarding_alert_types');
      if (!saved) return;
      const selectedTypes = JSON.parse(saved) as string[];
      await AsyncStorage.removeItem('onboarding_alert_types');

      const prefs = await api.getPreferences();
      const disabledCategories: Array<{
        categoryCode: string;
        subcategoryCode: string | null;
        enabled: boolean;
      }> = [];

      for (const cat of prefs.notifications) {
        for (const item of cat.items) {
          const shouldBeEnabled = selectedTypes.includes(item.categoryCode);
          if (item.enabled !== shouldBeEnabled) {
            disabledCategories.push({
              categoryCode: item.categoryCode,
              subcategoryCode: item.subcategoryCode,
              enabled: shouldBeEnabled,
            });
          }
        }
      }

      if (disabledCategories.length > 0) {
        await api.updatePreferences({ notifications: disabledCategories });
      }
    } catch {
      // Non-critical — preferences can be adjusted in Settings
    }
  }, []);

  // Register device when authenticated + has permission
  useEffect(() => {
    if (!isAuthenticated || !hasPermission) return;

    let unsubTokenRefresh: (() => void) | null = null;

    async function register() {
      const token = await getFcmToken();
      if (!token) return;

      const deviceId = await registerDeviceWithBackend(token);
      if (deviceId) {
        setIsRegistered(true);
        autoSaveLocationIfNeeded();
        syncOnboardingPreferences();
      }

      // Refresh token on backend when FCM rotates it
      unsubTokenRefresh = setupTokenRefreshListener(async (newToken) => {
        await refreshToken(newToken);
      });
    }

    register();

    return () => {
      unsubTokenRefresh?.();
    };
  }, [isAuthenticated, hasPermission, syncOnboardingPreferences]);

  // Deactivate device on sign-out
  useEffect(() => {
    if (prevAuthRef.current && !isAuthenticated) {
      deactivateDevice();
      setIsRegistered(false);
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated]);

  const value = useMemo<NotificationContextValue>(
    () => ({ hasPermission, isRegistered, requestPermission }),
    [hasPermission, isRegistered, requestPermission],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
