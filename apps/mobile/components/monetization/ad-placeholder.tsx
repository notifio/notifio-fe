import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useMembership } from '../../hooks/use-membership';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

interface AdPlaceholderProps {
  variant: 'banner' | 'card' | 'inline';
}

const VARIANT_HEIGHT: Record<AdPlaceholderProps['variant'], number> = {
  banner: 44,
  card: 120,
  inline: 32,
};

export function AdPlaceholder({ variant }: AdPlaceholderProps) {
  const { colors } = useAppTheme();
  const { tier } = useMembership();
  const { t } = useTranslation();

  if (tier !== 'FREE') return null;

  const height = VARIANT_HEIGHT[variant];

  return (
    <View
      style={[
        styles.container,
        {
          height,
          borderColor: colors.textMuted,
          backgroundColor: colors.surface,
        },
      ]}
    >
      <Text style={[styles.sponsoredLabel, { color: colors.textMuted }]}>
        {t('ads.sponsored')}
      </Text>
      <View
        style={[
          styles.placeholder,
          {
            backgroundColor: colors.border,
            width: variant === 'inline' ? 60 : 80,
            height: variant === 'banner' ? 20 : variant === 'inline' ? 16 : 40,
          },
        ]}
      />
      <Text style={[styles.adFreeText, { color: colors.primary }]}>
        {t('ads.adFree')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  sponsoredLabel: {
    fontSize: theme.fontSize.xs,
    ...theme.font.medium,
  },
  placeholder: {
    borderRadius: theme.radius.sm,
  },
  adFreeText: {
    fontSize: theme.fontSize.xs,
    ...theme.font.medium,
  },
});
