import { Tabs } from 'expo-router';
import { type LucideIcon, Bell, LayoutDashboard, Map, Settings } from 'lucide-react-native';
import { StyleSheet } from 'react-native';

import { Icon } from '../../components/ui/icon';
import { theme } from '../../lib/theme';

const TAB_SCREENS: { name: string; title: string; icon: LucideIcon }[] = [
  { name: 'index', title: 'Overview', icon: LayoutDashboard },
  { name: 'alerts', title: 'Alerts', icon: Bell },
  { name: 'map', title: 'Map', icon: Map },
  { name: 'settings', title: 'Settings', icon: Settings },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
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
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarLabel: {
    fontSize: theme.fontSize.xs,
  },
});
