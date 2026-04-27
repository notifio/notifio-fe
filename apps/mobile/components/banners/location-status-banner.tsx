import { IconBellOff, IconMapPinOff, IconX } from '@tabler/icons-react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { sharedColors } from '@notifio/ui';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

export function LocationStatusBanner() {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);
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
    checkPermissions();
  }, [checkPermissions]);

  if (dismissed || pushGranted === null || locationGranted === null) return null;
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
    <View style={[styles.container, { backgroundColor: bgColor, borderColor }]}>
      <StatusIcon size={18} color={sharedColors.info} />
      <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
        {message}
      </Text>
      <Pressable onPress={handleEnable} style={styles.enableButton} hitSlop={8}>
        <Text style={styles.enableText}>{t('banners.enable')}</Text>
      </Pressable>
      <Pressable onPress={() => setDismissed(true)} hitSlop={8}>
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
    marginTop: theme.spacing.sm,
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
