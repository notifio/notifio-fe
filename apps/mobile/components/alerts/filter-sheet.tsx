import { IconCheck } from '@tabler/icons-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';
import { BottomSheet } from '../ui/bottom-sheet';

type CategoryFilter = 'all' | 'weather' | 'traffic' | 'outages' | 'pollen';

const CATEGORY_OPTIONS: ReadonlyArray<{ id: CategoryFilter; labelKey: string }> = [
  { id: 'all', labelKey: 'alerts.filters.all' },
  { id: 'weather', labelKey: 'alerts.filters.weather' },
  { id: 'traffic', labelKey: 'alerts.filters.traffic' },
  { id: 'outages', labelKey: 'alerts.filters.outages' },
  { id: 'pollen', labelKey: 'alerts.filters.pollen' },
];

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  category: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
}

// Category-only bottom sheet. Lifecycle moved out to inline scroll-tabs
// in alert-list (option-3 redesign). Selection applies on tap; the
// "Done" button just closes — no draft state to commit.
export function FilterSheet({ open, onClose, category, onCategoryChange }: FilterSheetProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  return (
    <BottomSheet visible={open} onClose={onClose} title={t('alerts.filter')}>
      <View style={styles.body}>
        {CATEGORY_OPTIONS.map((opt) => {
          const active = category === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => onCategoryChange(opt.id)}
              style={[
                styles.option,
                {
                  backgroundColor: active ? `${colors.primary}1A` : 'transparent',
                },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: active ? colors.primary : colors.text },
                ]}
              >
                {t(opt.labelKey)}
              </Text>
              {active && <IconCheck size={18} color={colors.primary} />}
            </Pressable>
          );
        })}

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
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing['3xl'],
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: 4,
  },
  optionText: {
    fontSize: theme.fontSize.md,
    ...theme.font.medium,
  },
  doneButton: {
    marginTop: theme.spacing.lg,
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
