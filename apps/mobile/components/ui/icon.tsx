import type { LucideIcon } from 'lucide-react-native';

import { theme } from '../../lib/theme';

interface IconProps {
  icon: LucideIcon;
  size?: number;
  color?: string;
  style?: object;
}

export function Icon({ icon: IconComponent, size = 22, color = theme.colors.textMuted, style }: IconProps) {
  return <IconComponent size={size} color={color} style={style} />;
}
