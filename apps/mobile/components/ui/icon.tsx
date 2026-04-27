import type { Icon as TablerIcon } from '@tabler/icons-react-native';

import { useAppTheme } from '../../providers/theme-provider';

export type { TablerIcon };

interface IconProps {
  icon: TablerIcon;
  size?: number;
  color?: string;
  style?: object;
}

export function Icon({ icon: IconComponent, size = 22, color, style }: IconProps) {
  const { colors } = useAppTheme();
  const resolvedColor = color ?? colors.textMuted;
  return <IconComponent size={size} color={resolvedColor} style={style} />;
}
