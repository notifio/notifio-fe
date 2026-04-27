import type { Icon } from '@tabler/icons-react-native';
import { StyleSheet, View } from 'react-native';

// Darker shades for light-mode icons — matches web's CategoryIcon exactly.
const LIGHT_ICON_COLORS: Record<string, string> = {
  '#EAB308': '#B8930A',
  '#3A86FF': '#2B6BCC',
  '#FF3B30': '#CC2E25',
  '#8B5CF6': '#6D48C4',
  '#FF7A2F': '#CC6125',
  '#991B1B': '#7A1515',
  '#6B7A99': '#55627A',
  '#EC4899': '#BD3979',
};

interface CategoryIconProps {
  icon: Icon;
  color: string;
  isDark: boolean;
  size: number;
  iconSize: number;
  radius: number;
}

/**
 * Tinted square container with category icon. Used in filter panel rows.
 * Icon stroke color shifts darker in light mode for legibility on the
 * tinted background.
 */
export function CategoryIcon({
  icon: IconComponent,
  color,
  isDark,
  size,
  iconSize,
  radius,
}: CategoryIconProps) {
  const strokeColor = isDark ? color : LIGHT_ICON_COLORS[color] ?? color;
  const bgAlphaHex = isDark ? '26' : '1F'; // ~0.15 / ~0.12

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: `${color}${bgAlphaHex}`,
        },
      ]}
    >
      <IconComponent size={iconSize} color={strokeColor} strokeWidth={2} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
