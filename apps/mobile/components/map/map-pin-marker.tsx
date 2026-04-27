import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { getPinStyle } from '../../lib/map-pin-config';
import type { MapPin } from '../../lib/normalize-pins';

const PIN_W = 38;
const PIN_H = 50;
const SCHEDULED_OPACITY = 0.55;

interface MapPinMarkerProps {
  pin: MapPin;
}

/**
 * Teardrop-shaped pin matching web's MapMarker exactly.
 * Path data ported from apps/web/src/components/app/map-marker.tsx.
 * Tabler icon overlaid in the upper circle, white, strokeWidth 2.5.
 */
export function MapPinMarker({ pin }: MapPinMarkerProps) {
  const style = getPinStyle(pin);
  const IconComponent = style.icon;
  const opacity = pin.status === 'scheduled' ? SCHEDULED_OPACITY : 1;

  return (
    <View style={[styles.container, { opacity }]}>
      <Svg width={PIN_W} height={PIN_H} viewBox="0 0 24 32">
        <Path
          d="M12 0C5.373 0 0 5.373 0 12c0 8 12 20 12 20s12-12 12-20C24 5.373 18.627 0 12 0z"
          fill={style.color}
        />
      </Svg>
      <View style={styles.iconWrap}>
        <IconComponent size={18} color="#FFFFFF" strokeWidth={2.5} />
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
  iconWrap: {
    position: 'absolute',
    // The teardrop circle center sits roughly at y=12 in viewBox 24x32.
    // 12/32 * 50 = ~18.75. Center the 18pt icon there.
    top: 8,
    left: '50%',
    width: 18,
    height: 18,
    marginLeft: -9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
