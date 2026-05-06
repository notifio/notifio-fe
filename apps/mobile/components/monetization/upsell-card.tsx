import { IconCrown, IconX } from '@tabler/icons-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useMembership } from '@notifio/shared/hooks';

import { theme, withOpacity } from '../../lib/theme';
import { showToast } from '../../lib/toast';
import { useAppTheme } from '../../providers/theme-provider';

// Translation keys instead of literal strings — `t()` resolves at render
// so the daily-rotated message follows the active locale.
const UPSELL_MESSAGE_KEYS = [
  'upsell.messages.personalReminders',
  'upsell.messages.unlimitedLocations',
  'upsell.messages.removeAds',
  'upsell.messages.communityEvents',
  'upsell.messages.sourcePriorities',
  'upsell.messages.weatherThresholds',
  'upsell.messages.fineTuneSources',
];

export function UpsellCard() {
  const { colors } = useAppTheme();
  const { tier } = useMembership();
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  if (tier !== 'FREE' || dismissed) return null;

  const dayIndex = Math.floor(Date.now() / 86400000) % UPSELL_MESSAGE_KEYS.length;
  // dayIndex is mathematically bounded by the modulo above, so the
  // lookup is always defined — assert past TS's noUncheckedIndexedAccess.
  const message = t(UPSELL_MESSAGE_KEYS[dayIndex]!);

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: colors.primary,
          backgroundColor: withOpacity(colors.primary, 0.05),
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
        onPress={() => showToast.info(t('common.comingSoon'), t('upsell.upgradeSoon'))}
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
