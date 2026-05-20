import type { Icon } from '@tabler/icons-react';

import { hexToRgba } from '@notifio/shared';
import { getLightModeColor } from '@notifio/shared/map';

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
  const strokeColor = isDark ? color : getLightModeColor(color);
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
