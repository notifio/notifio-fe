import {
  IconAlertTriangle,
  IconCircleCheck,
  IconExclamationCircle,
  IconInfoCircle,
} from '@tabler/icons-react-native';
import { StyleSheet, Text, View } from 'react-native';
import type { BaseToastProps } from 'react-native-toast-message';

import { sharedColors } from '@notifio/ui';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

const ACCENT: Record<string, string> = {
  success: sharedColors.success,
  error: sharedColors.danger,
  info: sharedColors.info,
  warning: sharedColors.warning,
};

const ICONS = {
  success: IconCircleCheck,
  error: IconExclamationCircle,
  info: IconInfoCircle,
  warning: IconAlertTriangle,
} as const;

function ToastBody({ type, text1, text2 }: BaseToastProps & { type: string }) {
  const { colors } = useAppTheme();
  const accent = ACCENT[type] ?? sharedColors.info;
  const IconComponent = ICONS[type as keyof typeof ICONS] ?? IconInfoCircle;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderLeftColor: accent,
          borderLeftWidth: 4,
        },
      ]}
    >
      <IconComponent size={20} color={accent} style={styles.icon} />
      <View style={styles.textContainer}>
        {text1 ? <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{text1}</Text> : null}
        {text2 ? <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={3}>{text2}</Text> : null}
      </View>
    </View>
  );
}

export const toastConfig = {
  success: (props: BaseToastProps) => <ToastBody {...props} type="success" />,
  error: (props: BaseToastProps) => <ToastBody {...props} type="error" />,
  info: (props: BaseToastProps) => <ToastBody {...props} type="info" />,
  warning: (props: BaseToastProps) => <ToastBody {...props} type="warning" />,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '92%',
    minHeight: 56,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    paddingRight: theme.spacing.lg,
    // The colored accent strip lives on the container's own borderLeft
    // (set inline per-toast) so it tapers smoothly along the rounded
    // corners — mirrors web alert-card.tsx's CSS border-left + radius
    // pattern. Vertical padding stays on textContainer to keep icon
    // vertically centered against the row's alignItems: 'center'.
  },
  icon: {
    marginLeft: theme.spacing.md,
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
    paddingVertical: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.md,
    ...theme.font.semibold,
  },
  description: {
    fontSize: theme.fontSize.sm,
    marginTop: 2,
  },
});
