import {
  IconBell,
  IconChevronRight,
  IconClock,
  IconCrown,
  IconDatabase,
  IconDownload,
  IconInfoCircle,
  IconLogout,
  IconMapPin,
  IconPalette,
  IconShieldLock,
  IconStar,
  IconTemperature,
  IconTrash,
} from '@tabler/icons-react-native';
import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/ui/card';
import { ScreenHeader } from '../../components/ui/screen-header';
import { ScreenLayout } from '../../components/ui/screen-layout';
import { SectionLabel } from '../../components/ui/section-label';
import { SettingsRow } from '../../components/ui/settings-row';
import { TierBadge } from '../../components/ui/tier-badge';
import { useAuth } from '../../hooks/use-auth';
import { useMembership } from '../../hooks/use-membership';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

export default function SettingsScreen() {
  const { colors } = useAppTheme();
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
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const pushPlaceholder = (title: string) =>
    router.push({ pathname: '/settings/placeholder', params: { title } });

  return (
    <ScreenLayout scrollable header={<ScreenHeader title="Settings" />}>
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
            <TierBadge tier={tier} />
            <IconChevronRight size={18} color={colors.textMuted} />
          </View>
        </Card>
      </Pressable>

      {/* Account */}
      <SectionLabel label="Account" />
      <Card>
        <SettingsRow icon={IconCrown} label="Subscription" value={tier} onPress={() => pushPlaceholder('Subscription')} />
        <SettingsRow icon={IconMapPin} label="Locations" onPress={() => router.push('/settings/locations')} />
      </Card>

      {/* Preferences */}
      <SectionLabel label="Preferences" />
      <Card>
        <SettingsRow icon={IconBell} label="Notifications" onPress={() => router.push('/settings/notifications')} />
        <SettingsRow icon={IconPalette} label="Appearance" onPress={() => router.push('/settings/appearance')} />
        <SettingsRow icon={IconClock} label="Digest" onPress={() => pushPlaceholder('Digest')} />
      </Card>

      {/* Data */}
      <SectionLabel label="Data" />
      <Card>
        <SettingsRow icon={IconDatabase} label="Data Sources" onPress={() => pushPlaceholder('Data Sources')} />
        <SettingsRow icon={IconStar} label="Source Preferences" badge="PRO" onPress={() => pushPlaceholder('Source Preferences')} />
        <SettingsRow icon={IconTemperature} label="Weather Thresholds" badge="PRO" onPress={() => pushPlaceholder('Weather Thresholds')} />
      </Card>

      {/* Privacy */}
      <SectionLabel label="Privacy" />
      <Card>
        <SettingsRow icon={IconShieldLock} label="Privacy & Consents" onPress={() => router.push('/settings/privacy')} />
        <SettingsRow icon={IconDownload} label="Export My Data" onPress={() => router.push('/settings/data-export')} />
        <SettingsRow icon={IconTrash} label="Delete Account" danger onPress={() => router.push('/settings/delete-account')} />
      </Card>

      {/* App */}
      <SectionLabel label="App" />
      <Card>
        <SettingsRow icon={IconInfoCircle} label="About" value="0.1.0" onPress={() => pushPlaceholder('About')} />
        <SettingsRow icon={IconLogout} label="Sign Out" danger onPress={handleSignOut} />
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
