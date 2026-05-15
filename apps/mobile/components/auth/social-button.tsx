import {
  IconBrandAppleFilled,
  IconBrandFacebookFilled,
  IconBrandGoogleFilled,
  type Icon,
} from '@tabler/icons-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../lib/theme';

export type SocialProvider = 'google' | 'apple' | 'facebook';

interface SocialButtonProps {
  provider: SocialProvider;
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const BRAND: Record<
  SocialProvider,
  { bg: string; fg: string; border: string; Icon: Icon }
> = {
  google: {
    bg: '#FFFFFF',
    fg: '#1F1F1F',
    border: '#DADCE0',
    Icon: IconBrandGoogleFilled,
  },
  facebook: {
    bg: '#1877F2',
    fg: '#FFFFFF',
    border: '#1877F2',
    Icon: IconBrandFacebookFilled,
  },
  apple: {
    bg: '#000000',
    fg: '#FFFFFF',
    border: '#000000',
    Icon: IconBrandAppleFilled,
  },
};

export function SocialButton({
  provider,
  label,
  onPress,
  loading = false,
  disabled = false,
}: SocialButtonProps) {
  const { bg, fg, border, Icon } = BRAND[provider];
  const isInactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, borderColor: border },
        isInactive && styles.disabled,
        pressed && !isInactive && styles.pressed,
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator size="small" color={fg} />
        ) : (
          <Icon size={20} color={fg} />
        )}
        <Text style={[styles.label, { color: fg }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  label: {
    fontSize: 15,
    ...theme.font.medium,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});
