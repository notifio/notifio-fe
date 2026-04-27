import { Stack } from 'expo-router';

import { useAppTheme } from '../../providers/theme-provider';

export default function SettingsStackLayout() {
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
        headerBackTitle: 'Settings',
        headerShadowVisible: false,
      }}
    />
  );
}
