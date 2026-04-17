import type { Icon } from '@tabler/icons-react-native';
import { IconBolt, IconCar, IconDroplet, IconFlame, IconTemperature } from '@tabler/icons-react-native';
import { StyleSheet, View } from 'react-native';

import { MAP_PIN_STYLES } from '../../lib/map-pin-config';
import type { MapPin, MapPinSource } from '../../lib/normalize-pins';
import { shadows } from '../../lib/theme';

const SCHEDULED_OPACITY = 0.5;

const ICON_MAP: Record<MapPinSource, Icon> = {
  electricity: IconBolt,
  water: IconDroplet,
  gas: IconFlame,
  heat: IconTemperature,
  traffic: IconCar,
};

interface OutageMarkerProps {
  pin: MapPin;
}

export function OutageMarker({ pin }: OutageMarkerProps) {
  const style = MAP_PIN_STYLES[pin.source];
  const IconComponent = ICON_MAP[pin.source];
  const opacity = pin.status === 'scheduled' ? SCHEDULED_OPACITY : 1;

  return (
    <View
      style={[
        styles.marker,
        { backgroundColor: style.color, opacity },
        shadows.sm,
      ]}
    >
      <IconComponent size={12} color="#FFFFFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  marker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
