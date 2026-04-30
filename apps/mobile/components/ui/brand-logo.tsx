import { Image, type ImageStyle, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

interface BrandLogoProps {
  /** Pixel size of the square mark (default 56 — matches the welcome screen icon-circle scale). */
  size?: number;
  /** Hide the wordmark and render just the mark. */
  markOnly?: boolean;
  /** Optional override for the image style (margin/alignment). */
  imageStyle?: ImageStyle;
}

/**
 * Notifio brand mark + wordmark for mobile. Mirrors what the web app
 * renders on its TopBar / sign-in page (PR #59) so mobile launch +
 * authentication screens carry the same visual identity. Sourced from
 * the existing `assets/icon.png` so we don't ship a second copy of the
 * artwork and so any future re-design lands in one place.
 */
export function BrandLogo({ size = 56, markOnly = false, imageStyle }: BrandLogoProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.row}>
      <Image
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        source={require('../../assets/icon.png')}
        style={[{ width: size, height: size, borderRadius: theme.radius.lg }, imageStyle]}
        accessibilityIgnoresInvertColors
      />
      {!markOnly && (
        <Text style={[styles.wordmark, { color: colors.text }]}>Notifio</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  wordmark: {
    fontSize: theme.fontSize['2xl'],
    ...theme.font.bold,
  },
});
