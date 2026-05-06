import {
  IconBell,
  IconChevronRight,
  IconClock,
  IconCrown,
  IconDatabase,
  IconDownload,
  IconInfoCircle,
  IconLanguage,
  IconLogout,
  IconMapPin,
  IconPalette,
  IconShieldLock,
  IconStar,
  IconTemperature,
  IconTrash,
} from '@tabler/icons-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useMembership } from '@notifio/shared/hooks';

import { Card } from '../../components/ui/card';
import { ScreenHeader } from '../../components/ui/screen-header';
import { ScreenLayout } from '../../components/ui/screen-layout';
import { SectionLabel } from '../../components/ui/section-label';
import { SettingsRow } from '../../components/ui/settings-row';
import { TierBadge } from '../../components/ui/tier-badge';
import { useAuth } from '../../hooks/use-auth';
import { confirmDestructive } from '../../lib/confirm';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

export default function SettingsScreen() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { tier } = useMembership();
  const router = useRouter();

  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split('@')[0] ??
    '';
  const email = user?.email ?? '';
  const initial = displayName ? displayName.charAt(0).toUpperCase() : '?';

  const handleSignOut = () => {
    confirmDestructive({
      t,
      titleKey: 'settings.signOutConfirm.title',
      descKey: 'settings.signOutConfirm.message',
      cancelKey: 'settings.cancel',
      confirmKey: 'settings.signOutConfirm.confirm',
      onConfirm: signOut,
    });
  };

  return (
    <ScreenLayout scrollable header={<ScreenHeader title={t('settings.title')} />}>
      {/* Profile summary */}
      <Pressable
        onPress={() => router.push('/settings/profile')}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Card>
          <View style={styles.profileRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View style={styles.profileText}>
              <Text style={[styles.profileName, { color: colors.text }]} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.textMuted }]} numberOfLines={1}>
                {email}
              </Text>
            </View>
            <TierBadge tier={tier ?? 'FREE'} />
            <IconChevronRight size={18} color={colors.textMuted} />
          </View>
        </Card>
      </Pressable>

      {/* Account */}
      <SectionLabel label={t('settings.account')} />
      <Card>
        <SettingsRow icon={IconCrown} label={t('settings.subscription')} value={tier ?? undefined} onPress={() => router.push('/settings/subscription')} />
        <SettingsRow icon={IconMapPin} label={t('settings.locations')} onPress={() => router.push('/settings/locations')} />
      </Card>

      {/* Preferences */}
      <SectionLabel label={t('settings.preferences')} />
      <Card>
        <SettingsRow icon={IconBell} label={t('settings.notifications')} onPress={() => router.push('/settings/notifications')} />
        <SettingsRow icon={IconPalette} label={t('settings.appearance')} onPress={() => router.push('/settings/appearance')} />
        <SettingsRow icon={IconLanguage} label={t('settings.language')} onPress={() => router.push('/settings/language')} />
        <SettingsRow icon={IconClock} label={t('settings.digest')} onPress={() => router.push('/settings/digest')} />
      </Card>

      {/* Data */}
      <SectionLabel label={t('settings.data')} />
      <Card>
        <SettingsRow icon={IconDatabase} label={t('settings.dataSources')} onPress={() => router.push('/settings/sources')} />
        <SettingsRow icon={IconStar} label={t('settings.sourcePreferences')} badge="PRO" onPress={() => router.push('/settings/source-preferences')} />
        <SettingsRow icon={IconTemperature} label={t('settings.weatherThresholds')} badge="PRO" onPress={() => router.push('/settings/weather-thresholds')} />
      </Card>

      {/* Privacy */}
      <SectionLabel label={t('settings.privacy')} />
      <Card>
        <SettingsRow icon={IconShieldLock} label={t('settings.privacyAndConsents')} onPress={() => router.push('/settings/privacy')} />
        <SettingsRow icon={IconDownload} label={t('settings.exportData')} onPress={() => router.push('/settings/data-export')} />
        <SettingsRow icon={IconTrash} label={t('settings.deleteAccount')} danger onPress={() => router.push('/settings/delete-account')} />
      </Card>

      {/* App */}
      <SectionLabel label={t('settings.app')} />
      <Card>
        <SettingsRow icon={IconInfoCircle} label={t('settings.about')} onPress={() => router.push('/settings/about')} />
        <SettingsRow icon={IconLogout} label={t('auth.signOut')} danger onPress={handleSignOut} />
      </Card>

      <View style={styles.bottomSpacer} />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    color: '#FFFFFF',
    ...theme.font.bold,
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: theme.fontSize.md,
    ...theme.font.semibold,
  },
  profileEmail: {
    fontSize: theme.fontSize.sm,
    marginTop: 1,
  },
  bottomSpacer: {
    height: theme.spacing['2xl'],
  },
});
