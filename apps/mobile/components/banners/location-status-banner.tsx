import AsyncStorage from '@react-native-async-storage/async-storage';
import { IconBellOff, IconMapPinOff, IconX } from '@tabler/icons-react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { sharedColors } from '@notifio/ui';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

// PUSH-2: persist the dismissed state so it doesn't snap back every time
// the user navigates between tabs. 24-hour TTL — long enough not to be a
// nag, short enough that a missing permission still resurfaces the
// reminder on a fresh app session next day.
const DISMISSED_KEY = 'notifio_location_banner_dismissed_at';
const DISMISS_TTL_MS = 24 * 60 * 60 * 1000;

export function LocationStatusBanner() {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [dismissed, setDismissed] = useState<boolean | null>(null);
  const [pushGranted, setPushGranted] = useState<boolean | null>(null);
  const [locationGranted, setLocationGranted] = useState<boolean | null>(null);

  const checkPermissions = useCallback(async () => {
    const [notifStatus, locStatus] = await Promise.all([
      Notifications.getPermissionsAsync(),
      Location.getForegroundPermissionsAsync(),
    ]);
    setPushGranted(notifStatus.status === 'granted');
    setLocationGranted(locStatus.status === 'granted');
  }, []);

  useEffect(() => {
    void checkPermissions();
    void (async () => {
      const raw = await AsyncStorage.getItem(DISMISSED_KEY);
      if (!raw) {
        setDismissed(false);
        return;
      }
      const dismissedAt = parseInt(raw, 10);
      const stillFresh = Number.isFinite(dismissedAt) && Date.now() - dismissedAt < DISMISS_TTL_MS;
      setDismissed(stillFresh);
      if (!stillFresh) {
        // expired — clean up so we don't accumulate stale keys
        await AsyncStorage.removeItem(DISMISSED_KEY);
      }
    })();
  }, [checkPermissions]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    void AsyncStorage.setItem(DISMISSED_KEY, Date.now().toString());
  }, []);

  if (dismissed === null || pushGranted === null || locationGranted === null) return null;
  if (dismissed) return null;
  if (pushGranted && locationGranted) return null;

  const pushMissing = !pushGranted;
  const locationMissing = !locationGranted;

  let message: string;
  if (pushMissing && locationMissing) {
    message = t('banners.enableBoth');
  } else if (pushMissing) {
    message = t('banners.enablePush');
  } else {
    message = t('banners.enableLocation');
  }

  const StatusIcon = pushMissing ? IconBellOff : IconMapPinOff;

  const handleEnable = async () => {
    if (pushMissing) {
      await Notifications.requestPermissionsAsync();
    }
    if (locationMissing) {
      await Location.requestForegroundPermissionsAsync();
    }
    checkPermissions();
  };

  const bgColor = isDark ? 'rgba(58, 134, 255, 0.12)' : 'rgba(58, 134, 255, 0.08)';
  const borderColor = isDark ? 'rgba(58, 134, 255, 0.25)' : 'rgba(58, 134, 255, 0.15)';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          borderColor,
          // PUSH-3: respect the device safe-area inset so the banner
          // doesn't render under the status bar / notch. Tabs layout
          // doesn't wrap children in SafeAreaView, so we add the
          // padding here at the root of the banner instead. Add a
          // small breathing strip below the status bar.
          marginTop: insets.top + theme.spacing.sm,
        },
      ]}
    >
      <StatusIcon size={18} color={sharedColors.info} />
      <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
        {message}
      </Text>
      <Pressable onPress={handleEnable} style={styles.enableButton} hitSlop={8}>
        <Text style={styles.enableText}>{t('banners.enable')}</Text>
      </Pressable>
      <Pressable onPress={handleDismiss} hitSlop={8}>
        <IconX size={16} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginHorizontal: theme.spacing.lg,
    // marginTop is set inline so it can include the safe-area top inset
    marginBottom: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
  },
  message: {
    flex: 1,
    fontSize: theme.fontSize.xs,
    ...theme.font.medium,
  },
  enableButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    backgroundColor: sharedColors.info,
  },
  enableText: {
    fontSize: theme.fontSize.xs,
    color: '#FFFFFF',
    ...theme.font.semibold,
  },
});
