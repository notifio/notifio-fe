import { IconClock } from '@tabler/icons-react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

export default function PlaceholderScreen() {
  const { colors } = useAppTheme();
  const { title } = useLocalSearchParams<{ title?: string }>();

  return (
    <>
      <Stack.Screen options={{ title: title ?? 'Coming Soon' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
          <IconClock size={32} color={colors.textMuted} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Coming soon</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          This feature is under development.
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing['2xl'],
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: theme.spacing.lg,
    fontSize: theme.fontSize.xl,
    ...theme.font.bold,
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    textAlign: 'center',
  },
});
