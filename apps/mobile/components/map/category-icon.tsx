import type { Icon } from '@tabler/icons-react-native';
import { StyleSheet, View } from 'react-native';

import { getLightModeColor } from '@notifio/shared/map';

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
  const strokeColor = isDark ? color : getLightModeColor(color);
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
