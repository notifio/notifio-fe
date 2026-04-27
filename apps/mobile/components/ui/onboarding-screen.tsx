import { StyleSheet, Text, View } from 'react-native';

import { Icon, type TablerIcon } from './icon';
import { PrimaryButton } from './primary-button';
import { ScreenLayout } from './screen-layout';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

interface ActionConfig {
  title: string;
  onPress: () => void;
}

interface OnboardingScreenProps {
  icon: TablerIcon;
  title: string;
  description: string;
  primaryAction: ActionConfig;
  secondaryAction?: ActionConfig;
  children?: React.ReactNode;
}

export function OnboardingScreen({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  children,
}: OnboardingScreenProps) {
  const { colors } = useAppTheme();

  return (
    <ScreenLayout>
      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
          <Icon icon={icon} size={32} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
        {children && <View style={styles.childrenContainer}>{children}</View>}
      </View>
      <View style={styles.actions}>
        <PrimaryButton title={primaryAction.title} onPress={primaryAction.onPress} />
        {secondaryAction && (
          <PrimaryButton
            title={secondaryAction.title}
            onPress={secondaryAction.onPress}
            variant="ghost"
          />
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: theme.spacing['2xl'],
    textAlign: 'center',
    fontSize: theme.fontSize['2xl'],
    ...theme.font.bold,
  },
  description: {
    marginTop: theme.spacing.md,
    textAlign: 'center',
    fontSize: theme.fontSize.md,
    lineHeight: 24,
  },
  childrenContainer: {
    marginTop: theme.spacing['2xl'],
    width: '100%',
  },
  actions: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing['3xl'],
  },
});
