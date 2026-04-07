import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { api } from '../lib/api';

const DEVICE_ID_KEY = 'notifio_device_id';
const FCM_TOKEN_KEY = 'notifio_fcm_token';

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  }

  // Android
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function getFcmToken(): Promise<string | null> {
  try {
    return await messaging().getToken();
  } catch {
    return null;
  }
}

export async function registerDeviceWithBackend(
  fcmToken: string,
): Promise<string | null> {
  try {
    const { deviceId } = await api.registerDevice({
      fcmToken,
      platform: Platform.OS as 'ios' | 'android',
    });
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    await AsyncStorage.setItem(FCM_TOKEN_KEY, fcmToken);
    return deviceId;
  } catch {
    return null;
  }
}

export async function refreshToken(newFcmToken: string): Promise<void> {
  const deviceId = await getStoredDeviceId();
  if (!deviceId) return;

  try {
    await api.refreshDeviceToken(deviceId, newFcmToken);
    await AsyncStorage.setItem(FCM_TOKEN_KEY, newFcmToken);
  } catch {
    // Refresh failed — device may have been deleted on backend, re-register
    await registerDeviceWithBackend(newFcmToken);
  }
}

export async function getStoredDeviceId(): Promise<string | null> {
  return AsyncStorage.getItem(DEVICE_ID_KEY);
}

export async function deactivateDevice(): Promise<void> {
  const deviceId = await getStoredDeviceId();
  if (!deviceId) return;
  try {
    await api.deactivateDevice(deviceId);
  } catch {
    // Best-effort — device may already be deactivated
  }
  await AsyncStorage.removeItem(DEVICE_ID_KEY);
}

export function setupTokenRefreshListener(
  onTokenRefresh: (token: string) => void,
): () => void {
  return messaging().onTokenRefresh(onTokenRefresh);
}

export function configureForegroundNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export function setupBackgroundMessageHandler(): void {
  messaging().setBackgroundMessageHandler(async (_remoteMessage) => {
    // Background message received — expo-notifications displays it automatically
  });
}

export async function autoSaveLocationIfNeeded(): Promise<void> {
  try {
    const locResponse = await api.getLocations();
    if (locResponse.locations.length > 0) return;

    const pos = await new Promise<{ lat: number; lng: number } | null>((resolve) => {
      Notifications.getPermissionsAsync().then(({ status }) => {
        if (status !== 'granted') {
          resolve(null);
          return;
        }
        // RN provides navigator.geolocation at runtime even without DOM types
        const geo = (globalThis as Record<string, unknown>).navigator as
          | { geolocation?: { getCurrentPosition: (s: (p: { coords: { latitude: number; longitude: number } }) => void, e: () => void, o: object) => void } }
          | undefined;
        if (!geo?.geolocation) {
          resolve(null);
          return;
        }
        geo.geolocation.getCurrentPosition(
          (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
          () => resolve(null),
          { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
        );
      });
    });

    if (pos) {
      await api.createLocation({ lat: pos.lat, lng: pos.lng, label: 'home' });
    }
  } catch {
    // Non-critical — don't block notification flow
  }
}
