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
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
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
    paddingVertical: theme.spacing.md,
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
    borderTopLeftRadius: theme.radius.xl,
    borderBottomLeftRadius: theme.radius.xl,
  },
  icon: {
    marginLeft: theme.spacing.md,
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
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
