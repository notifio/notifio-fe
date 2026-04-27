import { IconCheck } from '@tabler/icons-react-native';
import { Pressable, type StyleProp, StyleSheet, Text, type ViewStyle } from 'react-native';

import { Icon, type TablerIcon } from './icon';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

interface SelectableRowProps {
  icon?: TablerIcon;
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function SelectableRow({ icon, label, selected, onPress, style }: SelectableRowProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed, style]}
    >
      {icon && <Icon icon={icon} color={colors.textSecondary} style={styles.icon} />}
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      {selected && <Icon icon={IconCheck} size={20} color={colors.primary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  icon: {
    marginRight: theme.spacing.md,
  },
  label: {
    flex: 1,
    fontSize: theme.fontSize.md,
  },
});
