import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import type { PollenResponse } from '@notifio/api-client';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

function aggregate(pollen: PollenResponse) {
  const c = pollen.components;
  return {
    tree: (c.birch ?? 0) + (c.alder ?? 0) + (c.olive ?? 0),
    grass: c.grass ?? 0,
    weed: (c.ragweed ?? 0) + (c.mugwort ?? 0),
  };
}

function levelFromValue(value: number): 'low' | 'moderate' | 'high' {
  if (value >= 50) return 'high';
  if (value >= 10) return 'moderate';
  return 'low';
}

const LEVEL_COLOR: Record<'low' | 'moderate' | 'high', string> = {
  low: '#22C55E',
  moderate: '#EAB308',
  high: '#EF4444',
};

interface Props {
  pollen: PollenResponse | null;
}

export function PollenCard({ pollen }: Props) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  if (!pollen) {
    return <View style={[styles.skeleton, { backgroundColor: colors.surface }]} />;
  }

  const buckets = aggregate(pollen);
  const items: Array<{ key: 'tree' | 'grass' | 'weed'; value: number }> = [
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
          return (
            <View key={key} style={styles.row}>
              <Text style={[styles.species, { color: colors.text }]}>
                {t(`pollen.species.${key}`)}
              </Text>
              <View style={[styles.levelPill, { backgroundColor: LEVEL_COLOR[level] }]}>
                <Text style={styles.levelText}>{t(`pollen.${level}`)}</Text>
              </View>
              <Text style={[styles.value, { color: colors.textMuted }]}>
                {Math.round(value)}
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
  levelPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  levelText: { color: '#FFFFFF', fontSize: 11, ...theme.font.medium },
  value: { marginLeft: 'auto', fontSize: theme.fontSize.xs },
});
