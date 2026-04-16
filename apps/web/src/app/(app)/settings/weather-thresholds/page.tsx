'use client';

import { IconCheck, IconLoader2, IconPlus, IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { UserWeatherThreshold } from '@notifio/api-client';

import { ProGate } from '@/components/app/pro-gate';
import { api } from '@/lib/api';

interface ThresholdConfig {
  subcategoryCode: string;
  labelKey: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  defaultValue: number;
  trackGradient: string;
  thumbColor: string;
}

const THRESHOLD_CONFIGS: ThresholdConfig[] = [
  {
    subcategoryCode: 'temp_high',
    labelKey: 'tempHigh',
    min: 20,
    max: 45,
    step: 1,
    unit: '°C',
    defaultValue: 35,
    trackGradient: 'linear-gradient(to right, #34C759, #FF7A2F)',
    thumbColor: '#FF7A2F',
  },
  {
    subcategoryCode: 'temp_low',
    labelKey: 'tempLow',
    min: -20,
    max: 10,
    step: 1,
    unit: '°C',
    defaultValue: -5,
    trackGradient: 'linear-gradient(to right, #3A86FF, #34C759)',
    thumbColor: '#3A86FF',
  },
  {
    subcategoryCode: 'wind_speed',
    labelKey: 'windSpeed',
    min: 20,
    max: 120,
    step: 5,
    unit: 'km/h',
    defaultValue: 60,
    trackGradient: 'linear-gradient(to right, #34C759, #F5D547)',
    thumbColor: '#F5D547',
  },
  {
    subcategoryCode: 'humidity',
    labelKey: 'humidity',
    min: 40,
    max: 100,
    step: 5,
    unit: '%',
    defaultValue: 80,
    trackGradient: 'linear-gradient(to right, #34C759, #3A86FF)',
    thumbColor: '#3A86FF',
  },
  {
    subcategoryCode: 'pressure',
    labelKey: 'pressure',
    min: 970,
    max: 1050,
    step: 5,
    unit: 'hPa',
    defaultValue: 1000,
    trackGradient: 'linear-gradient(to right, #6B7280, #9CA3AF)',
    thumbColor: '#9CA3AF',
  },
];

export default function WeatherThresholdsPage() {
  const t = useTranslations('weatherThresholds');
  const [thresholds, setThresholds] = useState<UserWeatherThreshold[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);
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
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const configuredCodes = new Set(thresholds.map((t) => t.subcategoryCode));
  const availableToAdd = THRESHOLD_CONFIGS.filter((c) => !configuredCodes.has(c.subcategoryCode));

  const handleSliderChange = useCallback(
    (subcategoryCode: string, value: number) => {
      // Optimistic update
      setThresholds((prev) =>
        prev.map((th) =>
          th.subcategoryCode === subcategoryCode
            ? { ...th, threshold: value }
            : th,
        ),
      );

      // Debounced save
      const existing = debounceRefs.current.get(subcategoryCode);
      if (existing) clearTimeout(existing);
      debounceRefs.current.set(
        subcategoryCode,
        setTimeout(async () => {
          try {
            await api.setWeatherThreshold({ subcategoryCode, threshold: value });
            setSaved(true);
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = setTimeout(() => setSaved(false), 2000);
          } catch {
            // silently fail
          }
        }, 500),
      );
    },
    [],
  );

  const handleAdd = useCallback(
    async (config: ThresholdConfig) => {
      setAddMenuOpen(false);
      try {
        const result = await api.setWeatherThreshold({
          subcategoryCode: config.subcategoryCode,
          threshold: config.defaultValue,
        });
        setThresholds((prev) => [...prev, result]);
      } catch {
        // silently fail
      }
    },
    [],
  );

  const handleDelete = useCallback(
    async (subcategoryCode: string) => {
      setDeletingCode(subcategoryCode);
      try {
        await api.deleteWeatherThreshold(subcategoryCode);
        setThresholds((prev) => prev.filter((th) => th.subcategoryCode !== subcategoryCode));
      } catch {
        // silently fail
      } finally {
        setDeletingCode(null);
      }
    },
    [],
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
              {thresholds.map((threshold) => {
                const config = THRESHOLD_CONFIGS.find(
                  (c) => c.subcategoryCode === threshold.subcategoryCode,
                );
                if (!config) return null;

                const percent = ((threshold.threshold - config.min) / (config.max - config.min)) * 100;

                return (
                  <div
                    key={threshold.subcategoryCode}
                    className="rounded-xl p-4"
                    style={{ backgroundColor: '#0B1B32' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text-primary">
                        {t(config.labelKey)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm font-bold"
                          style={{ color: config.thumbColor }}
                        >
                          {threshold.threshold}{config.unit}
                        </span>
                        <button
                          onClick={() => handleDelete(threshold.subcategoryCode)}
                          disabled={deletingCode === threshold.subcategoryCode}
                          className="rounded p-1 text-muted transition-colors hover:bg-white/10 hover:text-danger disabled:opacity-50"
                        >
                          {deletingCode === threshold.subcategoryCode ? (
                            <IconLoader2 size={14} className="animate-spin" />
                          ) : (
                            <IconX size={14} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Slider */}
                    <div className="relative mt-3">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ background: config.trackGradient }}
                      />
                      <input
                        type="range"
                        min={config.min}
                        max={config.max}
                        step={config.step}
                        value={threshold.threshold}
                        onChange={(e) =>
                          handleSliderChange(
                            threshold.subcategoryCode,
                            Number(e.target.value),
                          )
                        }
                        className="absolute inset-0 h-1.5 w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#0B1B32] [&::-moz-range-thumb]:bg-transparent [&::-moz-range-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0B1B32] [&::-webkit-slider-thumb]:bg-transparent [&::-webkit-slider-thumb]:appearance-none"
                      />
                      {/* Thumb circle overlay positioned by percent */}
                      <div
                        className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
                        style={{
                          left: `${percent}%`,
                          backgroundColor: config.thumbColor,
                          borderColor: '#0B1B32',
                        }}
                      />
                    </div>

                    <div className="mt-1.5 flex justify-between text-[10px] text-muted">
                      <span>{config.min}{config.unit}</span>
                      <span>{config.max}{config.unit}</span>
                    </div>
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
                      {availableToAdd.map((config) => (
                        <button
                          key={config.subcategoryCode}
                          onClick={() => handleAdd(config)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-text-primary transition-colors hover:bg-background"
                        >
                          <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: config.thumbColor }}
                          />
                          {t(config.labelKey)}
                        </button>
                      ))}
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
