import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { sharedColors } from '@notifio/ui';

import { theme } from '../../lib/theme';

const PIN_W = 38;
const PIN_H = 50;

interface MapClusterMarkerProps {
  count: number;
}

/**
 * Cluster marker — teardrop in accent orange with count text overlaid.
 * Matches the visual language of MapPinMarker so clusters and pins read
 * as part of the same family.
 */
export function MapClusterMarker({ count }: MapClusterMarkerProps) {
  return (
    <View style={styles.container}>
      <Svg width={PIN_W} height={PIN_H} viewBox="0 0 24 32">
        <Path
          d="M12 0C5.373 0 0 5.373 0 12c0 8 12 20 12 20s12-12 12-20C24 5.373 18.627 0 12 0z"
          fill={sharedColors.accent}
        />
      </Svg>
      <View style={styles.countWrap}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: PIN_W,
    height: PIN_H,
    position: 'relative',
  },
  countWrap: {
    position: 'absolute',
    top: 6,
    left: 0,
    right: 0,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    ...theme.font.bold,
  },
});
