import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PollenResponse } from '@notifio/api-client';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

type Level = 'low' | 'moderate' | 'high' | 'veryHigh';
type Species = 'tree' | 'grass' | 'weed';

function aggregate(pollen: PollenResponse) {
  const c = pollen.components;
  return {
    tree: (c.birch ?? 0) + (c.alder ?? 0) + (c.olive ?? 0),
    grass: c.grass ?? 0,
    weed: (c.ragweed ?? 0) + (c.mugwort ?? 0),
  };
}

function levelFromValue(value: number): Level {
  if (value >= 100) return 'veryHigh';
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

const RECOMMENDATION_FALLBACK: Record<Level, string> = {
  low: 'Low pollen levels — generally safe.',
  moderate: 'Moderate pollen — sensitive people may experience symptoms.',
  high: 'High pollen — limit outdoor exposure if sensitive.',
  veryHigh: 'Very high pollen — minimise outdoor time.',
};

interface Props {
  pollen: PollenResponse | null;
}

export function PollenCard({ pollen }: Props) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [expanded, setExpanded] = useState<Species | null>(null);

  if (!pollen) {
    return <View style={[styles.skeleton, { backgroundColor: colors.surface }]} />;
  }

  const buckets = aggregate(pollen);
  const items: Array<{ key: Species; value: number }> = [
    { key: 'tree', value: buckets.tree },
    { key: 'grass', value: buckets.grass },
    { key: 'weed', value: buckets.weed },
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        {t('pollen.species.tree')} · {t('pollen.species.grass')} · {t('pollen.species.weed')}
      </Text>
      <View style={styles.rows}>
        {items.map(({ key, value }) => {
          const level = levelFromValue(value);
          const recommendation = t(`pollen.recommendation.${level}`, {
            defaultValue: RECOMMENDATION_FALLBACK[level],
          });
          return (
            <View key={key}>
              <Pressable
                onLongPress={() => setExpanded(expanded === key ? null : key)}
                style={styles.row}
              >
                <Text style={[styles.species, { color: colors.text }]}>
                  {t(`pollen.species.${key}`)}
                </Text>
                <Text style={[styles.value, { color: colors.text }]}>{Math.round(value)}</Text>
                <Text style={[styles.unit, { color: colors.textMuted }]}>
                  {t('pollen.unit', { defaultValue: 'grains/m³' })}
                </Text>
                <View style={[styles.chip, { backgroundColor: LEVEL_COLOR[level] }]} />
              </Pressable>
              {expanded === key && (
                <Text style={[styles.expanded, { color: colors.textSecondary }]}>
                  {recommendation}
                </Text>
              )}
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
  value: { fontSize: theme.fontSize.sm, ...theme.font.semibold },
  unit: { fontSize: theme.fontSize.xs },
  chip: {
    marginLeft: 'auto',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  expanded: {
    fontSize: theme.fontSize.xs,
    lineHeight: 16,
    marginTop: 4,
  },
});
