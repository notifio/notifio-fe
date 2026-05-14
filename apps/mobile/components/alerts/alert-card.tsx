import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '@notifio/api-client';
import {
  ACCENT_COLORS,
  type AlertCardItem,
  SEVERITY_COLORS,
  hexToRgba,
} from '@notifio/shared/alert-card';
import { formatRelativeTime, type RelativeTimeLocale } from '@notifio/shared/format';

import { api } from '../../lib/api';
import { getNotificationIcon } from '../../lib/category-icons';
import { theme } from '../../lib/theme';
import { showToast } from '../../lib/toast';
import { useAppTheme } from '../../providers/theme-provider';
import { Card } from '../ui/card';

interface AlertCardProps {
  item: AlertCardItem;
  onPress?: () => void;
}

export function AlertCard({ item, onPress }: AlertCardProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const locale = i18n.language as RelativeTimeLocale;
  const { Icon, color: iconColor } = getNotificationIcon(item.category);

  const severityKey = item.severityCode ?? 'info';
  const severityPill = SEVERITY_COLORS[severityKey] ?? {
    bg: 'rgba(58,134,255,0.15)',
    text: '#3A86FF',
  };
  const accentColor = item.resolved
    ? '#34C759'
    : (ACCENT_COLORS[severityKey] ?? '#3A86FF');

  const [voted, setVoted] = useState<'valid' | 'invalid' | null>(null);
  const [voting, setVoting] = useState(false);

  const handleVote = async (isValid: boolean) => {
    if (voting || voted !== null) return;
    setVoting(true);
    try {
      await api.voteOnEvent(item.eventId, isValid);
      setVoted(isValid ? 'valid' : 'invalid');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setVoted(isValid ? 'valid' : 'invalid');
      } else {
        showToast.error(t('events.voteError', { defaultValue: 'Vote failed' }));
      }
    } finally {
      setVoting(false);
    }
  };

  return (
    <Card
      onPress={onPress}
      style={{
        borderLeftWidth: 3,
        borderLeftColor: accentColor,
        opacity: item.resolved ? 0.55 : 1,
      }}
    >
      <View style={styles.row}>
        <View style={[styles.iconTile, { backgroundColor: hexToRgba(iconColor, 0.15) }]}>
          <Icon size={28} color={iconColor} strokeWidth={2} />
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          {item.body ? (
            <Text
              style={[styles.body, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {item.body}
            </Text>
          ) : null}

          <View style={styles.metaRow}>
            {item.resolved ? (
              <View
                style={[
                  styles.severityPill,
                  { backgroundColor: 'rgba(52,199,89,0.15)' },
                ]}
              >
                <Text style={[styles.severityText, { color: '#34C759' }]}>
                  {t('notificationType.all_clear')}
                </Text>
              </View>
            ) : (
              <View style={[styles.severityPill, { backgroundColor: severityPill.bg }]}>
                <Text style={[styles.severityText, { color: severityPill.text }]}>
                  {t(`notificationSeverity.${severityKey}`)}
                </Text>
              </View>
            )}
            <Text style={[styles.relativeTime, { color: colors.textMuted }]}>
              {formatRelativeTime(item.createdAt, locale)}
            </Text>
          </View>

          {item.isCommunity && !item.resolved && (
            <View style={[styles.voteRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.voteLabel, { color: colors.textMuted }]}>
                {t('events.stillHappening')}
              </Text>
              <Pressable
                onPress={() => handleVote(true)}
                disabled={voted !== null || voting}
                style={({ pressed }) => [
                  styles.voteButton,
                  (pressed || voted === 'valid') && styles.voteButtonPressed,
                ]}
              >
                <Text
                  style={[
                    styles.voteText,
                    { color: voted === 'valid' ? '#34C759' : colors.text },
                  ]}
                >
                  {t('events.confirm')}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleVote(false)}
                disabled={voted !== null || voting}
                style={({ pressed }) => [
                  styles.voteButton,
                  (pressed || voted === 'invalid') && styles.voteButtonPressed,
                ]}
              >
                <Text
                  style={[
                    styles.voteText,
                    { color: voted === 'invalid' ? '#FF3B30' : colors.text },
                  ]}
                >
                  {t('events.deny')}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: theme.fontSize.md,
    ...theme.font.semibold,
  },
  body: {
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: theme.spacing.sm,
  },
  severityPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 10,
    ...theme.font.medium,
  },
  relativeTime: {
    fontSize: 11,
  },
  voteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  voteLabel: {
    flex: 1,
    fontSize: 11,
  },
  voteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  voteButtonPressed: {
    opacity: 0.5,
  },
  voteText: {
    fontSize: 12,
    ...theme.font.medium,
  },
});
