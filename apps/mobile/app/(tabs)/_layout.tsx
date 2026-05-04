import { IconBell, IconLayoutDashboard, IconMap, IconSettings } from '@tabler/icons-react-native';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { DeletionBanner } from '../../components/banners/deletion-banner';
import { LocationStatusBanner } from '../../components/banners/location-status-banner';
import { Icon, type TablerIcon } from '../../components/ui/icon';
import { useDeletionStatus } from '../../hooks/use-deletion-status';
import { theme } from '../../lib/theme';
import { showToast } from '../../lib/toast';
import { useAppTheme } from '../../providers/theme-provider';

// i18n keys instead of literal titles — resolved at render so the tab
// bar follows the active locale. nav.map + nav.settings come from
// shared (Step 11 avatar menu); nav.overview + nav.alerts are
// mobile-only (web uses nav.dashboard / nav.notifications instead).
const TAB_SCREENS: { name: string; titleKey: string; icon: TablerIcon }[] = [
  { name: 'index', titleKey: 'nav.overview', icon: IconLayoutDashboard },
  { name: 'alerts', titleKey: 'nav.alerts', icon: IconBell },
  { name: 'map', titleKey: 'nav.map', icon: IconMap },
  { name: 'settings', titleKey: 'nav.settings', icon: IconSettings },
];

export default function TabLayout() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const { deletionScheduledAt, cancelDeletion } = useDeletionStatus();

  const handleCancelDeletion = async () => {
    try {
      await cancelDeletion();
      showToast.success(t('deletion.cancelSuccess'));
    } catch {
      showToast.error(t('deletion.cancelError'));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LocationStatusBanner />
      {deletionScheduledAt && (
        <DeletionBanner scheduledAt={deletionScheduledAt} onCancel={handleCancelDeletion} />
      )}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: [styles.tabBar, { backgroundColor: colors.background, borderTopColor: colors.border }],
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: styles.tabBarLabel,
        }}
      >
        {TAB_SCREENS.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: t(tab.titleKey),
              tabBarIcon: ({ color }) => <Icon icon={tab.icon} size={22} color={color} />,
            }}
          />
        ))}
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    borderTopWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarLabel: {
    fontSize: theme.fontSize.xs,
  },
});
