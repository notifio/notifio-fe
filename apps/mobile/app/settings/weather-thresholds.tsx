import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { WEATHER_THRESHOLD_CODES } from '../../components/settings/weather-thresholds/codes';
import { EditSheet } from '../../components/settings/weather-thresholds/edit-sheet';
import { ThresholdCard } from '../../components/settings/weather-thresholds/threshold-card';
import { ProGate } from '../../components/ui/pro-gate';
import { useWeatherThresholds } from '../../hooks/use-weather-thresholds';
import { theme } from '../../lib/theme';
import { useAppTheme } from '../../providers/theme-provider';

const PRO_BADGE_BG = '#FF7A2F';
const PRO_BADGE_TEXT = '#2C1607';

function SkeletonCard() {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.skeleton,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    />
  );
}

function ProBadge() {
  return (
    <View style={[styles.proBadge, { backgroundColor: PRO_BADGE_BG }]}>
      <Text style={[styles.proBadgeText, { color: PRO_BADGE_TEXT }]}>PRO</Text>
    </View>
  );
}

function WeatherThresholdsContent() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const { isLoading, getByCode, setThreshold, removeThreshold } = useWeatherThresholds();
  const [editingCode, setEditingCode] = useState<string | null>(null);

  const editingConfig = useMemo(
    () => WEATHER_THRESHOLD_CODES.find((c) => c.code === editingCode) ?? null,
    [editingCode],
  );

  const editingValue = editingConfig ? getByCode(editingConfig.code)?.threshold ?? null : null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('weatherThresholds.title')}
        </Text>
        <ProBadge />
      </View>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {t('weatherThresholds.description')}
      </Text>

      <View style={styles.cards}>
        {isLoading
          ? WEATHER_THRESHOLD_CODES.map((c) => <SkeletonCard key={c.code} />)
          : WEATHER_THRESHOLD_CODES.map((c) => {
              const current = getByCode(c.code);
              return (
                <ThresholdCard
                  key={c.code}
                  code={c.code}
                  icon={c.icon}
                  label={t(`weatherThresholds.${c.labelKey}`)}
                  unit={c.unit}
                  currentValue={current ? current.threshold : null}
                  notSetLabel={t('weatherThresholds.notSet')}
                  onPress={() => setEditingCode(c.code)}
                />
              );
            })}
      </View>

      <EditSheet
        visible={editingConfig !== null}
        onClose={() => setEditingCode(null)}
        code={editingConfig?.code ?? null}
        icon={editingConfig?.icon ?? null}
        label={editingConfig ? t(`weatherThresholds.${editingConfig.labelKey}`) : ''}
        unit={editingConfig?.unit ?? ''}
        currentValue={editingValue}
        invalidValueLabel={t('weatherThresholds.invalidValue')}
        saveLabel={t('reminders.save')}
        removeLabel={t('reminders.delete')}
        onSave={async (value) => {
          if (editingConfig) await setThreshold(editingConfig.code, value);
        }}
        onRemove={async () => {
          if (editingConfig) await removeThreshold(editingConfig.code);
        }}
      />
    </ScrollView>
  );
}

export default function WeatherThresholdsScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  return (
    <>
      <Stack.Screen options={{ title: t('weatherThresholds.title') }} />
      <View style={[styles.gateWrapper, { backgroundColor: colors.background }]}>
        <ProGate requiredTier="PRO">
          <WeatherThresholdsContent />
        </ProGate>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gateWrapper: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing['4xl'],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.xl,
    ...theme.font.bold,
  },
  proBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  proBadgeText: {
    fontSize: 10,
    letterSpacing: 1,
    ...theme.font.bold,
  },
  description: {
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
  cards: {
    gap: theme.spacing.md,
  },
  skeleton: {
    height: 72,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    opacity: 0.5,
  },
});
