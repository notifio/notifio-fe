import { Pressable, StyleSheet, View } from 'react-native';

import { sharedColors } from '@notifio/ui';

interface MapToggleProps {
  on: boolean;
  onToggle: () => void;
  partial?: boolean;
  isDark: boolean;
  small?: boolean;
}

/**
 * Pill-style switch for the map filter panel.
 * Orange when on (sharedColors.accent), translucent gray when off.
 * Knob opacity dims when `partial` (parent on, some children off).
 */
export function MapToggle({ on, onToggle, partial, isDark, small }: MapToggleProps) {
  const w = small ? 30 : 36;
  const h = small ? 16 : 20;
  const knob = small ? 12 : 16;
  const pad = 2;

  const trackColor = on
    ? sharedColors.accent
    : isDark
      ? 'rgba(255,255,255,0.15)'
      : 'rgba(14,34,63,0.15)';

  return (
    <Pressable
      onPress={onToggle}
      hitSlop={8}
      style={[
        styles.track,
        {
          width: w,
          height: h,
          borderRadius: h / 2,
          backgroundColor: trackColor,
        },
      ]}
    >
      <View
        style={[
          styles.knob,
          {
            top: pad,
            left: on ? w - knob - pad : pad,
            width: knob,
            height: knob,
            borderRadius: knob / 2,
            opacity: partial ? 0.6 : 1,
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    position: 'relative',
    flexShrink: 0,
  },
  knob: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
});
