import { IconBell, IconLayoutDashboard, IconMap, IconSettings } from '@tabler/icons-react-native';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { LocationStatusBanner } from '../../components/banners/location-status-banner';
import { Icon, type TablerIcon } from '../../components/ui/icon';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

const TAB_SCREENS: { name: string; title: string; icon: TablerIcon }[] = [
  { name: 'index', title: 'Overview', icon: IconLayoutDashboard },
  { name: 'alerts', title: 'Alerts', icon: IconBell },
  { name: 'map', title: 'Map', icon: IconMap },
  { name: 'settings', title: 'Settings', icon: IconSettings },
];

export default function TabLayout() {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LocationStatusBanner />
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
              title: tab.title,
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
