import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  WEATHER_THRESHOLD_METRICS,
  type WeatherThresholdMetricConfig,
} from '../../components/settings/weather-thresholds/codes';
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
  const [editingMetric, setEditingMetric] = useState<WeatherThresholdMetricConfig | null>(null);

  const editingState = useMemo(() => {
    if (!editingMetric) return null;
    const warning = getByCode(editingMetric.tiers.warning.code)?.threshold ?? null;
    const severe = getByCode(editingMetric.tiers.severe.code)?.threshold ?? null;
    return {
      warning,
      severe,
      hasAny: warning !== null || severe !== null,
    };
  }, [editingMetric, getByCode]);

  const handleSave = async (warning: number, severe: number) => {
    if (!editingMetric) return;
    await Promise.all([
      setThreshold(editingMetric.tiers.warning.code, warning),
      setThreshold(editingMetric.tiers.severe.code, severe),
    ]);
  };

  const handleRemove = async () => {
    if (!editingMetric) return;
    await Promise.all([
      removeThreshold(editingMetric.tiers.warning.code),
      removeThreshold(editingMetric.tiers.severe.code),
    ]);
  };

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
          ? WEATHER_THRESHOLD_METRICS.map((m) => <SkeletonCard key={m.metric} />)
          : WEATHER_THRESHOLD_METRICS.map((m) => {
              const warningValue = getByCode(m.tiers.warning.code)?.threshold ?? null;
              const severeValue = getByCode(m.tiers.severe.code)?.threshold ?? null;
              return (
                <ThresholdCard
                  key={m.metric}
                  icon={m.icon}
                  label={t(`weatherThresholds.metric.${m.metric}`)}
                  unit={m.unit}
                  warningValue={warningValue}
                  severeValue={severeValue}
                  warningLabel={t(`weatherThresholds.tier.${m.metric}.warning`)}
                  severeLabel={t(`weatherThresholds.tier.${m.metric}.severe`)}
                  notSetLabel={t('weatherThresholds.notSet')}
                  onPress={() => setEditingMetric(m)}
                />
              );
            })}
      </View>

      <EditSheet
        visible={editingMetric !== null}
        onClose={() => setEditingMetric(null)}
        metric={editingMetric}
        metricLabel={editingMetric ? t(`weatherThresholds.metric.${editingMetric.metric}`) : ''}
        warningLabel={editingMetric ? t(`weatherThresholds.tier.${editingMetric.metric}.warning`) : ''}
        severeLabel={editingMetric ? t(`weatherThresholds.tier.${editingMetric.metric}.severe`) : ''}
        warningCurrent={editingState?.warning ?? null}
        severeCurrent={editingState?.severe ?? null}
        hasAnyValue={editingState?.hasAny ?? false}
        invalidValueLabel={t('weatherThresholds.invalidValue')}
        saveLabel={t('reminders.save')}
        removeLabel={t('reminders.delete')}
        onSave={handleSave}
        onRemove={handleRemove}
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
