import { Stack } from 'expo-router';

import { useAppTheme } from '../../providers/theme-provider';

export default function EventsLayout() {
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
        headerShadowVisible: false,
      }}
    />
  );
}
