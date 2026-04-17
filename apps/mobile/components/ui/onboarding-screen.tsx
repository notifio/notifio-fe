import { StyleSheet, Text, View } from 'react-native';

import { Icon, type TablerIcon } from './icon';
import { PrimaryButton } from './primary-button';
import { ScreenLayout } from './screen-layout';
import { theme } from '../../lib/theme';

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
  return (
    <ScreenLayout>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Icon icon={icon} size={32} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
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
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: theme.spacing['2xl'],
    textAlign: 'center',
    fontSize: theme.fontSize['2xl'],
    color: theme.colors.text,
    ...theme.font.bold,
  },
  description: {
    marginTop: theme.spacing.md,
    textAlign: 'center',
    fontSize: theme.fontSize.md,
    lineHeight: 24,
    color: theme.colors.textMuted,
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
