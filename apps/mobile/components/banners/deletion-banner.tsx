import { IconAlertTriangle } from '@tabler/icons-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { sharedColors } from '@notifio/ui';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

interface DeletionBannerProps {
  scheduledAt: string;
  onCancel: () => void;
}

function formatCountdown(scheduledAt: string): string {
  const diff = new Date(scheduledAt).getTime() - Date.now();
  if (diff <= 0) return '0m';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function DeletionBanner({ scheduledAt, onCancel }: DeletionBannerProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(() => formatCountdown(scheduledAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(formatCountdown(scheduledAt));
    }, 60_000);
    return () => clearInterval(interval);
  }, [scheduledAt]);

  const bgColor = isDark ? 'rgba(255, 59, 48, 0.12)' : 'rgba(255, 59, 48, 0.08)';
  const borderColor = isDark ? 'rgba(255, 59, 48, 0.25)' : 'rgba(255, 59, 48, 0.15)';

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderColor }]}>
      <IconAlertTriangle size={18} color={sharedColors.danger} />
      <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
        {t('banners.deletionCountdown', { time: countdown })}
      </Text>
      <Pressable onPress={onCancel} style={styles.cancelButton} hitSlop={8}>
        <Text style={styles.cancelText}>{t('banners.cancelDeletion')}</Text>
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
  cancelButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    backgroundColor: sharedColors.danger,
  },
  cancelText: {
    fontSize: theme.fontSize.xs,
    color: '#FFFFFF',
    ...theme.font.semibold,
  },
});
