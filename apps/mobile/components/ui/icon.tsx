import type { Icon as TablerIcon } from '@tabler/icons-react-native';

import { theme } from '../../lib/theme';

export type { TablerIcon };

interface IconProps {
  icon: TablerIcon;
  size?: number;
  color?: string;
  style?: object;
}

export function Icon({ icon: IconComponent, size = 22, color = theme.colors.textMuted, style }: IconProps) {
  return <IconComponent size={size} color={color} style={style} />;
}
