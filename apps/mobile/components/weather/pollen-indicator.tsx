import { IconPlant2, IconX } from '@tabler/icons-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../lib/theme';

// TODO: Replace with real pollen endpoint when BE adds GET /api/v1/pollen
const MOCK_ALLERGENS: { key: string; value: number }[] = [
  { key: 'birch', value: 85 },
  { key: 'grass', value: 12 },
  { key: 'alder', value: 5 },
  { key: 'ragweed', value: 0 },
];

const MAX_BAR_VALUE = 100;

export interface PollenData {
  level: string;
  dominant: string;
  value: number;
  unit: string;
}

const POLLEN_HEALTH_KEYS: Record<string, string> = {
  High: 'pollen.high',
  Moderate: 'pollen.moderate',
  Low: 'pollen.low',
};

interface PollenChipProps {
  pollen: PollenData;
  isExpanded: boolean;
  dimmed: boolean;
  onToggle: () => void;
}

export function PollenChip({ pollen, isExpanded, dimmed, onToggle }: PollenChipProps) {
  

  return (
    <Pressable
      onPress={onToggle}
      style={[
        styles.chip,
        isExpanded && styles.chipActive,
        dimmed && styles.chipDimmed,
      ]}
    >
      <IconPlant2 size={14} color="#FFFFFF" />
      <Text style={styles.chipText}>
        {pollen.dominant} {pollen.value} {pollen.unit}
      </Text>
    </Pressable>
  );
}

interface PollenDetailPanelProps {
  pollen: PollenData;
  onClose: () => void;
}

export function PollenDetailPanel({ pollen, onClose }: PollenDetailPanelProps) {
  const { t } = useTranslation();
  const healthKey = POLLEN_HEALTH_KEYS[pollen.level] ?? 'pollen.moderate';

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.healthText}>{t(healthKey)}</Text>
        <Pressable onPress={onClose} hitSlop={8}>
          <IconX size={14} color="rgba(255,255,255,0.5)" />
        </Pressable>
      </View>
      <View style={styles.bars}>
        {MOCK_ALLERGENS.filter((a) => a.value > 0).map((allergen) => {
          const pct = Math.min((allergen.value / MAX_BAR_VALUE) * 100, 100);
          const barColor = allergen.value >= 50 ? '#F59E0B' : '#22C55E';
          return (
            <View key={allergen.key} style={styles.barRow}>
              <Text style={styles.barLabel}>{t(`pollen.${allergen.key}`)}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: barColor }]} />
              </View>
              <Text style={styles.barValue}>{allergen.value}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  chipActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  chipDimmed: {
    opacity: 0.7,
  },
  chipText: {
    fontSize: 12,
    color: '#FFFFFF',
    ...theme.font.medium,
  },
  panel: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: 10,
    paddingHorizontal: 12,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  healthText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    flex: 1,
    marginRight: 8,
  },
  bars: {
    marginTop: 8,
    gap: 6,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    width: 50,
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  barValue: {
    width: 28,
    textAlign: 'right',
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    ...theme.font.medium,
  },
});
