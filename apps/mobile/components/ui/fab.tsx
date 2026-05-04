import type { ComponentType } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { SPACING } from '../../lib/spacing';
import { useAppTheme } from '../../providers/theme-provider';

type IconComponent = ComponentType<{ size?: number; color?: string }>;

interface FABProps {
  icon: IconComponent;
  onPress: () => void;
  /** Distance from bottom edge in pt. Default SPACING.fabBottom (24). */
  bottom?: number;
  /** Distance from right edge in pt. Default SPACING.fabRight (24). */
  right?: number;
  /** When true: greyed bg, Pressable disabled. Default false. */
  disabled?: boolean;
  /** Optional accessibility label. */
  accessibilityLabel?: string;
}

/**
 * Round 56×56 floating action button. Brand-orange when enabled,
 * muted-grey when disabled. Self-positions absolutely with overridable
 * bottom/right offsets.
 */
export function FAB({
  icon: Icon,
  onPress,
  bottom = SPACING.fabBottom,
  right = SPACING.fabRight,
  disabled = false,
  accessibilityLabel,
}: FABProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.fab,
        { bottom, right, backgroundColor: disabled ? colors.textMuted : colors.primary },
      ]}
    >
      <Icon size={24} color="#FFFFFF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
