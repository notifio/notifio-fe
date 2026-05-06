import { IconBell } from '@tabler/icons-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { shadows, theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';
import { Card } from '../ui/card';
import { Icon } from '../ui/icon';

interface MapStatusCardProps {
  alertCount: number;
}

export function MapStatusCard({ alertCount }: MapStatusCardProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const hasAlerts = alertCount > 0;

  return (
    <View style={styles.wrapper}>
      <Card style={styles.card}>
        <View style={styles.row}>
          {hasAlerts ? (
            <View style={[styles.dot, { backgroundColor: colors.danger }]} />
          ) : (
            <Icon icon={IconBell} size={18} color={colors.textMuted} />
          )}
          <Text
            style={[styles.text, { color: hasAlerts ? colors.text : colors.textMuted }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {hasAlerts
              ? t('map.activeIncidents', { count: alertCount })
              : t('map.noActiveIncidents')}
          </Text>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: theme.spacing['3xl'],
    left: theme.spacing.xl,
    right: theme.spacing.xl,
  },
  card: {
    ...shadows.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: theme.radius.full,
  },
  text: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
});
