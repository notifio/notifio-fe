'use client';

import {
  IconCheck,
  IconCloudRain,
  IconLoader2,
  IconPlus,
  IconSnowflake,
  IconTemperature,
  IconWind,
  IconX,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { UserWeatherThreshold } from '@notifio/api-client';

import { ProGate } from '@/components/app/pro-gate';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';

// ── Canonical config (mirrors mobile) ───────────────────────────────

type WeatherMetric =
  | 'highTemperature'
  | 'lowTemperature'
  | 'windSpeed'
  | 'rainfall'
  | 'snowfall';

interface MetricConfig {
  metric: WeatherMetric;
  icon: typeof IconTemperature;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaults: { warning: number; severe: number };
  tiers: {
    warning: { code: string; thumbColor: string };
    severe: { code: string; thumbColor: string };
  };
  trackGradient: string;
}

/**
 * Canonical Weather Intelligence subcategory codes confirmed against
 * notifio-api/src/services/user-weather-threshold.service.ts. BE rejects
 * anything outside this set with HTTP 400. Mirrors the mobile config.
 *
 * Two tiers per metric: a softer "warning" + a sharper "severe" variant.
 * Severe tier uses metric-specific labels in i18n (Frost / Severe wind /
 * Heavy rain / Heavy snow / Extreme heat) rather than a generic word.
 */
const WEATHER_THRESHOLD_METRICS: readonly MetricConfig[] = [
  {
    metric: 'highTemperature',
    icon: IconTemperature,
    unit: '°C',
    min: 20,
    max: 45,
    step: 1,
    defaults: { warning: 28, severe: 35 },
    tiers: {
      warning: { code: 'heat_warning', thumbColor: '#FF7A2F' },
      severe: { code: 'extreme_heat_warning', thumbColor: '#FF3B30' },
    },
    trackGradient: 'linear-gradient(to right, #34C759, #FF7A2F, #FF3B30)',
  },
  {
    metric: 'lowTemperature',
    icon: IconTemperature,
    unit: '°C',
    min: -30,
    max: 5,
    step: 1,
    defaults: { warning: -5, severe: -15 },
    tiers: {
      warning: { code: 'low_temperature_warning', thumbColor: '#3A86FF' },
      severe: { code: 'frost_warning', thumbColor: '#1E40AF' },
    },
    trackGradient: 'linear-gradient(to right, #1E40AF, #3A86FF, #34C759)',
  },
  {
    metric: 'windSpeed',
    icon: IconWind,
    unit: 'km/h',
    min: 30,
    max: 130,
    step: 5,
    defaults: { warning: 50, severe: 80 },
    tiers: {
      warning: { code: 'wind_warning', thumbColor: '#F5D547' },
      severe: { code: 'severe_wind_warning', thumbColor: '#FF3B30' },
    },
    trackGradient: 'linear-gradient(to right, #34C759, #F5D547, #FF3B30)',
  },
  {
    metric: 'rainfall',
    icon: IconCloudRain,
    unit: 'mm/h',
    min: 1,
    max: 50,
    step: 1,
    defaults: { warning: 10, severe: 25 },
    tiers: {
      warning: { code: 'rain_warning', thumbColor: '#3A86FF' },
      severe: { code: 'heavy_rain_warning', thumbColor: '#1E40AF' },
    },
    trackGradient: 'linear-gradient(to right, #34C759, #3A86FF, #1E40AF)',
  },
  {
    metric: 'snowfall',
    icon: IconSnowflake,
    unit: 'cm/h',
    min: 1,
    max: 30,
    step: 1,
    defaults: { warning: 5, severe: 15 },
    tiers: {
      warning: { code: 'snow_warning', thumbColor: '#9CA3AF' },
      severe: { code: 'heavy_snow_warning', thumbColor: '#6B7280' },
    },
    trackGradient: 'linear-gradient(to right, #34C759, #9CA3AF, #6B7280)',
  },
];

// ── Page ─────────────────────────────────────────────────────────────

export default function WeatherThresholdsPage() {
  const t = useTranslations('weatherThresholds');
  const toast = useToast();

  const [thresholds, setThresholds] = useState<UserWeatherThreshold[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [deletingMetric, setDeletingMetric] = useState<WeatherMetric | null>(null);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const addMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!addMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setAddMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [addMenuOpen]);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getWeatherThresholds();
        setThresholds(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : t('loadFailed');
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const findValue = (code: string): number | null =>
    thresholds.find((th) => th.subcategoryCode === code)?.threshold ?? null;

  const isMetricConfigured = (m: MetricConfig): boolean =>
    findValue(m.tiers.warning.code) !== null || findValue(m.tiers.severe.code) !== null;

  const configuredMetrics = WEATHER_THRESHOLD_METRICS.filter(isMetricConfigured);
  const availableToAdd = WEATHER_THRESHOLD_METRICS.filter((m) => !isMetricConfigured(m));

  const flashSaved = () => {
    setSaved(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => setSaved(false), 2000);
  };

  /**
   * Debounced single-tier save — fires on each slider drag stop. Web's
   * UX is per-slider (not a "save both" button), so each tier writes
   * independently. Errors surface via toast — no more silent fail.
   */
  const handleSliderChange = useCallback(
    (subcategoryCode: string, value: number) => {
      // Optimistic update
      setThresholds((prev) => {
        const idx = prev.findIndex((th) => th.subcategoryCode === subcategoryCode);
        if (idx >= 0) {
          return prev.map((th) =>
            th.subcategoryCode === subcategoryCode ? { ...th, threshold: value } : th,
          );
        }
        return [...prev, { subcategoryCode, threshold: value, updatedAt: new Date().toISOString() } as UserWeatherThreshold];
      });

      const existing = debounceRefs.current.get(subcategoryCode);
      if (existing) clearTimeout(existing);
      debounceRefs.current.set(
        subcategoryCode,
        setTimeout(async () => {
          try {
            await api.setWeatherThreshold({ subcategoryCode, threshold: value });
            flashSaved();
          } catch (err) {
            const msg = err instanceof Error ? err.message : t('saveFailed');
            toast.error(msg);
          }
        }, 500),
      );
    },
    [t, toast],
  );

  const handleAdd = useCallback(
    async (config: MetricConfig) => {
      setAddMenuOpen(false);
      try {
        const [warningResult, severeResult] = await Promise.all([
          api.setWeatherThreshold({
            subcategoryCode: config.tiers.warning.code,
            threshold: config.defaults.warning,
          }),
          api.setWeatherThreshold({
            subcategoryCode: config.tiers.severe.code,
            threshold: config.defaults.severe,
          }),
        ]);
        setThresholds((prev) => [...prev, warningResult, severeResult]);
        flashSaved();
      } catch (err) {
        const msg = err instanceof Error ? err.message : t('saveFailed');
        toast.error(msg);
      }
    },
    [t, toast],
  );

  const handleDeleteMetric = useCallback(
    async (m: MetricConfig) => {
      setDeletingMetric(m.metric);
      try {
        await Promise.all([
          api.deleteWeatherThreshold(m.tiers.warning.code),
          api.deleteWeatherThreshold(m.tiers.severe.code),
        ]);
        setThresholds((prev) =>
          prev.filter(
            (th) =>
              th.subcategoryCode !== m.tiers.warning.code &&
              th.subcategoryCode !== m.tiers.severe.code,
          ),
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : t('deleteFailed');
        toast.error(msg);
      } finally {
        setDeletingMetric(null);
      }
    },
    [t, toast],
  );

  return (
    <ProGate requiredTier="PRO">
      <div className="mx-auto max-w-2xl px-4 py-8 md:px-8 md:py-10">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
            PRO
          </span>
        </div>
        <p className="mt-1 text-sm text-muted">{t('description')}</p>

        {saved && (
          <div className="mt-4 flex items-center gap-1.5 text-xs text-green-500">
            <IconCheck size={14} />
            {t('saved')}
          </div>
        )}

        <div className="mt-8 space-y-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <IconLoader2 size={28} className="animate-spin text-accent" />
            </div>
          ) : (
            <>
              {configuredMetrics.map((config) => {
                const Icon = config.icon;
                const warningValue = findValue(config.tiers.warning.code) ?? config.defaults.warning;
                const severeValue = findValue(config.tiers.severe.code) ?? config.defaults.severe;
                const isDeleting = deletingMetric === config.metric;

                return (
                  <div
                    key={config.metric}
                    className="rounded-xl p-4"
                    style={{ backgroundColor: '#0B1B32' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon size={16} className="text-muted" />
                        <span className="text-sm font-medium text-text-primary">
                          {t(`metric.${config.metric}`)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteMetric(config)}
                        disabled={isDeleting}
                        className="rounded p-1 text-muted transition-colors hover:bg-white/10 hover:text-danger disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <IconLoader2 size={14} className="animate-spin" />
                        ) : (
                          <IconX size={14} />
                        )}
                      </button>
                    </div>

                    <TierSlider
                      tierLabel={t(`tier.${config.metric}.warning`)}
                      tierDescription={t(`tier.${config.metric}.warningDescription`)}
                      value={warningValue}
                      unit={config.unit}
                      min={config.min}
                      max={config.max}
                      step={config.step}
                      thumbColor={config.tiers.warning.thumbColor}
                      trackGradient={config.trackGradient}
                      onChange={(v) => handleSliderChange(config.tiers.warning.code, v)}
                    />

                    <TierSlider
                      tierLabel={t(`tier.${config.metric}.severe`)}
                      tierDescription={t(`tier.${config.metric}.severeDescription`)}
                      value={severeValue}
                      unit={config.unit}
                      min={config.min}
                      max={config.max}
                      step={config.step}
                      thumbColor={config.tiers.severe.thumbColor}
                      trackGradient={config.trackGradient}
                      onChange={(v) => handleSliderChange(config.tiers.severe.code, v)}
                    />
                  </div>
                );
              })}

              {/* Add threshold button */}
              {availableToAdd.length > 0 && (
                <div ref={addMenuRef} className="relative">
                  <button
                    onClick={() => setAddMenuOpen(!addMenuOpen)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-accent"
                  >
                    <IconPlus size={16} />
                    {t('addThreshold')}
                  </button>

                  {addMenuOpen && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-xl border border-border bg-card p-1 shadow-lg">
                      {availableToAdd.map((config) => {
                        const Icon = config.icon;
                        return (
                          <button
                            key={config.metric}
                            onClick={() => handleAdd(config)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-text-primary transition-colors hover:bg-background"
                          >
                            <Icon size={14} className="text-muted" />
                            {t(`metric.${config.metric}`)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProGate>
  );
}

// ── Tier slider section ──────────────────────────────────────────────

interface TierSliderProps {
  tierLabel: string;
  tierDescription: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  thumbColor: string;
  trackGradient: string;
  onChange: (value: number) => void;
}

function TierSlider({
  tierLabel,
  tierDescription,
  value,
  unit,
  min,
  max,
  step,
  thumbColor,
  trackGradient,
  onChange,
}: TierSliderProps) {
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <div className="mt-3 border-t border-white/5 pt-3 first-of-type:border-t-0 first-of-type:pt-0">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: thumbColor }}>
            {tierLabel}
          </span>
          <span className="text-[11px] text-muted">{tierDescription}</span>
        </div>
        <span className="text-sm font-bold" style={{ color: thumbColor }}>
          {value}{unit}
        </span>
      </div>
      <div className="relative mt-3">
        <div className="h-1.5 rounded-full" style={{ background: trackGradient }} />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-1.5 w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#0B1B32] [&::-moz-range-thumb]:bg-transparent [&::-moz-range-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0B1B32] [&::-webkit-slider-thumb]:bg-transparent [&::-webkit-slider-thumb]:appearance-none"
        />
        <div
          className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{
            left: `${percent}%`,
            backgroundColor: thumbColor,
            borderColor: '#0B1B32',
          }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-muted">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
