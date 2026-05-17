import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import type { PollenResponse } from '@notifio/api-client';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

type Level = 'low' | 'moderate' | 'high' | 'veryHigh';

function levelFromValue(value: number): Level {
  if (value >= 200) return 'veryHigh';
  if (value >= 50) return 'high';
  if (value >= 10) return 'moderate';
  return 'low';
}

const LEVEL_COLOR: Record<Level, string> = {
  low: '#1D9E75',
  moderate: '#FFD27F',
  high: '#FF7A2F',
  veryHigh: '#FF3B30',
};

const FULL_SCALE = 200;

interface Props {
  pollen: PollenResponse | null;
}

export function PollenCard({ pollen }: Props) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  if (!pollen) {
    return <View style={[styles.skeleton, { backgroundColor: colors.surface }]} />;
  }

  // Drop nulls (BE absent-this-region) AND zeros (off-season — no active
  // grain) — both render as empty bars and clutter the card.
  const entries = Object.entries(pollen.components ?? {}).filter(
    ([, value]) => typeof value === 'number' && value > 0,
  ) as Array<[string, number]>;

  const unit = t('pollen.unit', { defaultValue: pollen.unit });

  if (entries.length === 0) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('pollen.title', { defaultValue: 'Pollen' })}
        </Text>
        <Text style={[styles.empty, { color: colors.textMuted }]}>
          {t('pollen.noData', { defaultValue: 'Aktuálne žiadne aktívne druhy peľu.' })}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        {t('pollen.title', { defaultValue: 'Pollen' })}
      </Text>
      <View style={styles.rows}>
        {entries.map(([species, value]) => {
          const level = levelFromValue(value);
          const percent = Math.min(100, (value / FULL_SCALE) * 100);
          const label = t(`pollen.${species}`, { defaultValue: species });
          return (
            <View key={species} style={styles.row}>
              <Text style={[styles.species, { color: colors.text }]}>{label}</Text>
              <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${percent}%`, backgroundColor: LEVEL_COLOR[level] },
                  ]}
                />
              </View>
              <Text style={[styles.value, { color: colors.textMuted }]} numberOfLines={1}>
                {value.toFixed(1)} {unit}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  skeleton: { height: 140, borderRadius: theme.radius.xl },
  title: { fontSize: theme.fontSize.md, ...theme.font.semibold },
  rows: { gap: theme.spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  species: { width: 72, fontSize: theme.fontSize.sm },
  empty: { fontSize: theme.fontSize.sm },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: { height: 6, borderRadius: 3 },
  value: { width: 96, textAlign: 'right', fontSize: theme.fontSize.xs },
});
