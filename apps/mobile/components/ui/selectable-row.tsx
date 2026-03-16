import { type LucideIcon, Check } from 'lucide-react-native';
import { Pressable, type StyleProp, StyleSheet, Text, type ViewStyle } from 'react-native';

import { Icon } from './icon';
import { theme } from '../../lib/theme';

interface SelectableRowProps {
  icon?: LucideIcon;
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function SelectableRow({ icon, label, selected, onPress, style }: SelectableRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed, style]}
    >
      {icon && <Icon icon={icon} color={theme.colors.textSecondary} style={styles.icon} />}
      <Text style={styles.label}>{label}</Text>
      {selected && <Icon icon={Check} size={20} color={theme.colors.primary} />}
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
    color: theme.colors.text,
  },
});
