import { IconBell, IconChevronRight, IconGlobe, IconLogout, IconPalette } from '@tabler/icons-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/ui/card';
import { AppIcon } from '../../components/ui/icon';
import { ScreenHeader } from '../../components/ui/screen-header';
import { ScreenLayout } from '../../components/ui/screen-layout';
import { useAuth } from '../../hooks/use-auth';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

export default function ProfileScreen() {
  const { colors } = useAppTheme();

  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const name = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? '';
  const email = user?.email ?? '';
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  const currentLang = i18n.language === 'sk' ? t('profile.languageSk') : t('profile.languageEn');

  return (
    <ScreenLayout scrollable header={<ScreenHeader title={t('screens.profile.title')} />}>
      {/* IconUser info */}
      <Card style={styles.userCard}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{name}</Text>
            <Text style={styles.userEmail}>{email}</Text>
          </View>
          <View style={styles.tierBadge}>
            <Text style={styles.tierText}>{t('profile.free')}</Text>
          </View>
        </View>
      </Card>

      {/* Settings rows */}
      <Card style={styles.menuCard}>
        <Pressable style={styles.menuRow} onPress={() => router.push('/settings/preferences')}>
          <AppIcon icon={IconBell} size={20} color={colors.primary} />
          <Text style={styles.menuLabel}>{t('profile.notificationPreferences')}</Text>
          <IconChevronRight size={18} color={colors.textMuted} />
        </Pressable>

        <View style={styles.menuDivider} />

        <View style={styles.menuRow}>
          <AppIcon icon={IconGlobe} size={20} color={colors.primary} />
          <Text style={styles.menuLabel}>{t('profile.language')}</Text>
          <Text style={styles.menuValue}>{currentLang}</Text>
        </View>

        <View style={styles.menuDivider} />

        <View style={styles.menuRow}>
          <AppIcon icon={IconPalette} size={20} color={colors.primary} />
          <Text style={styles.menuLabel}>{t('profile.theme')}</Text>
          <Text style={styles.menuValue}>{t('profile.themeSystem')}</Text>
        </View>
      </Card>

      {/* Sign out */}
      <Card style={styles.menuCard}>
        <Pressable style={styles.menuRow} onPress={signOut}>
          <AppIcon icon={IconLogout} size={20} color={colors.danger} />
          <Text style={styles.signOutText}>{t('profile.signOut')}</Text>
        </Pressable>
      </Card>

      {/* Version */}
      <Text style={styles.versionText}>
        {t('profile.version')} 0.1.0
      </Text>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  userCard: {
    marginTop: theme.spacing.sm,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    color: '#FFFFFF',
    ...theme.font.bold,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    ...theme.font.semibold,
  },
  userEmail: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  tierBadge: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  tierText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    ...theme.font.medium,
  },
  menuCard: {
    marginTop: theme.spacing.md,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  menuLabel: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  menuValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  menuDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: 36,
  },
  signOutText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.danger,
    ...theme.font.medium,
  },
  versionText: {
    textAlign: 'center',
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing['3xl'],
    paddingBottom: theme.spacing['2xl'],
  },
});
