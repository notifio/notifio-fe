import { StyleSheet, Text, View } from 'react-native';

import { sharedColors } from '@notifio/ui';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

const MIN_VOTES = 5;

interface CredibilityBarProps {
  votesValid: number;
  votesInvalid: number;
  total: number;
  score: number;
}

export function CredibilityBar({ total, score }: CredibilityBarProps) {
  const { colors } = useAppTheme();

  if (total < MIN_VOTES) {
    return (
      <View style={styles.container}>
        <Text style={[styles.noVotes, { color: colors.textMuted }]}>No votes yet</Text>
      </View>
    );
  }

  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const validWidth = `${percent}%` as const;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.percentText, { color: colors.text }]}>{percent}% credible</Text>
        <Text style={[styles.countText, { color: colors.textMuted }]}>{total} votes</Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <View style={[styles.fill, { width: validWidth, backgroundColor: sharedColors.success }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  percentText: {
    fontSize: theme.fontSize.sm,
    ...theme.font.semibold,
  },
  countText: {
    fontSize: theme.fontSize.xs,
  },
  noVotes: {
    fontSize: theme.fontSize.sm,
    textAlign: 'center',
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    borderRadius: 4,
  },
});
