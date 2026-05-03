import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

type StatusFilter = 'active' | 'ended' | 'all';

const STATUS_OPTIONS: ReadonlyArray<{ id: StatusFilter; labelKey: string }> = [
  { id: 'active', labelKey: 'alerts.active' },
  { id: 'ended', labelKey: 'alerts.ended' },
  { id: 'all', labelKey: 'alerts.all' },
];

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
}

/**
 * Bottom sheet for History tab status filter. Mirrors the
 * Modal+slide pattern used by cluster-events-sheet.tsx and
 * upsell-sheet.tsx — sibling backdrop + sheet so the inner content
 * doesn't bubble taps to the dismiss handler.
 */
export function FilterSheet({ open, onClose, status, onStatusChange }: FilterSheetProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <Text style={[styles.title, { color: colors.text }]}>
            {t('alerts.filter')}
          </Text>

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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing['3xl'],
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 999,
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.md,
    ...theme.font.semibold,
    marginBottom: theme.spacing.lg,
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
