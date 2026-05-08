import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';
import { BottomSheet } from '../ui/bottom-sheet';

type StatusFilter = 'active' | 'upcoming' | 'ended' | 'all';

const STATUS_OPTIONS: ReadonlyArray<{ id: StatusFilter; labelKey: string }> = [
  { id: 'active', labelKey: 'alerts.active' },
  { id: 'upcoming', labelKey: 'alerts.upcoming' },
  { id: 'ended', labelKey: 'alerts.ended' },
  { id: 'all', labelKey: 'alerts.all' },
];

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
}

export function FilterSheet({ open, onClose, status, onStatusChange }: FilterSheetProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  return (
    <BottomSheet visible={open} onClose={onClose} title={t('alerts.filter')}>
      <View style={styles.body}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          {t('alerts.status')}
        </Text>

        <View style={styles.optionRow}>
          {STATUS_OPTIONS.map((opt) => {
            const active = status === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => onStatusChange(opt.id)}
                style={[
                  styles.option,
                  {
                    backgroundColor: active ? colors.primary : 'transparent',
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.optionText,
                    { color: active ? '#FFFFFF' : colors.textMuted },
                  ]}
                >
                  {t(opt.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={onClose}
          style={[styles.doneButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.doneText}>{t('common.done')}</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing['3xl'],
  },
  sectionLabel: {
    fontSize: theme.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    ...theme.font.semibold,
    marginBottom: theme.spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  optionText: {
    fontSize: theme.fontSize.sm,
    ...theme.font.medium,
  },
  doneButton: {
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
  },
  doneText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.sm,
    ...theme.font.semibold,
  },
});
