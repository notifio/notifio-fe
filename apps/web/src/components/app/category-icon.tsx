import type { Icon } from '@tabler/icons-react';

import { hexToRgba } from '@/lib/color';

// Darker shades for light-mode icons
const LIGHT_ICON_COLORS: Record<string, string> = {
  '#EAB308': '#B8930A',
  '#3A86FF': '#2B6BCC',
  '#FF3B30': '#CC2E25',
  '#8B5CF6': '#6D48C4',
  '#FF7A2F': '#CC6125',
  '#991B1B': '#7A1515',
  '#6B7A99': '#55627A',
};

interface CategoryIconProps {
  icon: Icon;
  color: string;
  isDark: boolean;
  size: number;
  iconSize: number;
  radius: number;
}

export function CategoryIcon({
  icon: IconComponent,
  color,
  isDark,
  size,
  iconSize,
  radius,
}: CategoryIconProps) {
  const strokeColor = isDark ? color : (LIGHT_ICON_COLORS[color] ?? color);
  const bgAlpha = isDark ? 0.15 : 0.12;

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${radius}px`,
        backgroundColor: hexToRgba(color, bgAlpha),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <IconComponent size={iconSize} color={strokeColor} strokeWidth={2} />
    </div>
  );
}
