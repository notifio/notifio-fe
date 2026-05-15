import { StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from './brand-logo';
import { Icon, type TablerIcon } from './icon';
import { PrimaryButton } from './primary-button';
import { ScreenLayout } from './screen-layout';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

interface ActionConfig {
  title: string;
  onPress: () => void;
  loading?: boolean;
  loadingTitle?: string;
  disabled?: boolean;
}

interface OnboardingScreenProps {
  icon: TablerIcon;
  title: string;
  description: string;
  primaryAction?: ActionConfig;
  secondaryAction?: ActionConfig;
  children?: React.ReactNode;
  /**
   * Render the Notifio brand mark + wordmark above the icon. Mirrors
   * the web app's PR #59 (Logo on sign-in / app shell). Welcome and
   * login screens turn this on; in-flow onboarding steps don't.
   */
  showBrand?: boolean;
}

export function OnboardingScreen({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  children,
  showBrand = false,
}: OnboardingScreenProps) {
  const { colors } = useAppTheme();

  return (
    <ScreenLayout>
      {showBrand && (
        <View style={styles.brand}>
          <BrandLogo size={48} />
        </View>
      )}
      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
          <Icon icon={icon} size={32} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
        {children && <View style={styles.childrenContainer}>{children}</View>}
      </View>
      <View style={styles.spacer} />
      <View style={styles.actions}>
        {primaryAction && (
          <PrimaryButton
            title={
              primaryAction.loading
                ? (primaryAction.loadingTitle ?? primaryAction.title)
                : primaryAction.title
            }
            onPress={primaryAction.onPress}
            loading={primaryAction.loading}
            disabled={primaryAction.disabled}
          />
        )}
        {secondaryAction && (
          <PrimaryButton
            title={secondaryAction.title}
            onPress={secondaryAction.onPress}
            variant="ghost"
            disabled={secondaryAction.disabled}
            loading={secondaryAction.loading}
          />
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  brand: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  // Was `flex: 1` + `justifyContent: 'center'` — that pushed the icon
  // mid-screen, visually orphaning it from the brand at the top. Now
  // content stacks naturally under the brand; the spacer below pushes
  // actions to the bottom.
  content: {
    alignItems: 'center',
    paddingTop: theme.spacing['2xl'],
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
    paddingHorizontal: theme.spacing.xl,
    textAlign: 'center',
    fontSize: theme.fontSize.md,
    lineHeight: 24,
  },
  childrenContainer: {
    marginTop: theme.spacing['2xl'],
    width: '100%',
  },
  spacer: {
    flex: 1,
  },
  actions: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing['3xl'],
  },
});
