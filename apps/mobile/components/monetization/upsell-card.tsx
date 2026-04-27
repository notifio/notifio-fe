import { IconCrown, IconX } from '@tabler/icons-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useMembership } from '../../hooks/use-membership';
import { theme } from '../../lib/theme';
import { showToast } from '../../lib/toast';
import { useAppTheme } from '../../providers/theme-provider';

const UPSELL_MESSAGES = [
  'Set up personal reminders with PRO',
  'Get unlimited locations with PLUS',
  'Remove ads and support Notifio',
  'Create and report community events',
  'Customize data source priorities with PRO',
  'Unlock custom weather thresholds',
  'Fine-tune notification sources with PRO',
];

export function UpsellCard() {
  const { colors } = useAppTheme();
  const { tier } = useMembership();
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  if (tier !== 'FREE' || dismissed) return null;

  const dayIndex = Math.floor(Date.now() / 86400000) % UPSELL_MESSAGES.length;
  const message = UPSELL_MESSAGES[dayIndex];

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: colors.primary,
          backgroundColor: `${colors.primary}0D`,
        },
      ]}
    >
      <Pressable
        onPress={() => setDismissed(true)}
        style={styles.dismissButton}
        hitSlop={8}
        accessibilityLabel={t('upsell.dismiss')}
      >
        <IconX size={16} color={colors.textMuted} />
      </Pressable>

      <View style={styles.content}>
        <IconCrown size={20} color={colors.primary} />
        <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
          {message}
        </Text>
      </View>

      <Pressable
        onPress={() => showToast.info('Coming soon', 'Upgrade will be available soon.')}
        style={[styles.upgradeButton, { backgroundColor: colors.primary }]}
      >
        <Text style={[styles.upgradeText, { color: colors.textInverse }]}>
          {t('upsell.upgrade')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
  },
  dismissButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    zIndex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.xl,
  },
  message: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  upgradeButton: {
    marginTop: theme.spacing.md,
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  upgradeText: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
});
