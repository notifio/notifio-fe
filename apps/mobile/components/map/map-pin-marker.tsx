import { IconCalendar } from '@tabler/icons-react-native';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { MapPin } from '@notifio/shared/map';

import { getPinStyle } from '../../lib/map-pin-config';

const PIN_W = 38;
/** Exported so the parent <Marker> can compute its iOS centerOffset. */
export const PIN_H = 50;
// Upcoming pins are dimmed so the user can tell future events from
// active ones at a glance (matches web's MapMarker styling).
const UPCOMING_OPACITY = 0.85;
const BADGE_SIZE = 16;
const BADGE_BG = '#162D4F';

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
  const isUpcoming = !pin.isTeaser && pin.status === 'upcoming';
  // Step 8: teaser pins (off-tier previews) are dimmed harder than
  // upcoming events so the user can tell at a glance the pin isn't
  // interactive — tapping routes to the upsell sheet via the parent.
  const opacity = pin.isTeaser ? 0.4 : isUpcoming ? UPCOMING_OPACITY : 1;

  return (
    <View style={styles.container}>
      <View style={{ opacity }}>
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
      {isUpcoming && (
        <View style={styles.calendarBadge}>
          <IconCalendar size={10} color="#FFFFFF" strokeWidth={2.5} />
        </View>
      )}
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
  calendarBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    backgroundColor: BADGE_BG,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
