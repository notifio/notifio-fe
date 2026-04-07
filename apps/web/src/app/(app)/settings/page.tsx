'use client';

import { IconLoader2 } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { signOut } from '@/app/(app)/actions';
import { PreferenceSection } from '@/components/app/settings/preference-section';
import { PushNotificationsToggle } from '@/components/app/settings/push-notifications-toggle';
import { SelectableOption } from '@/components/ui/selectable-option';
import { Toggle } from '@/components/ui/toggle';
import { usePreferences } from '@/hooks/use-preferences';
import { useSupabaseUser } from '@/hooks/use-supabase-user';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const ta = useTranslations('auth');
  const { email } = useSupabaseUser();
  const THEME_OPTIONS = [
    { value: 'system' as const, label: t('themeSystem'), description: 'Follow your device settings' },
    { value: 'light' as const, label: t('themeLight') },
    { value: 'dark' as const, label: t('themeDark') },
  ];

  const UNITS_OPTIONS = [
    { value: 'metric' as const, label: t('unitsMetric'), description: '°C, km/h, mm' },
    { value: 'imperial' as const, label: t('unitsImperial'), description: '°F, mph, in' },
  ];

  const {
    preferences,
    isLoading,
    saving,
    error,
    hasChanges,
    toggleItem,
    toggleCategory,
    setDisplay,
    savePreferences,
    cancelChanges,
  } = usePreferences();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 md:px-8">
      <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>

      <div className="mt-10 space-y-10">
        <PreferenceSection title={t('pushNotifications')} description={t('pushDescription')}>
          <PushNotificationsToggle />
        </PreferenceSection>

        <PreferenceSection title={t('notificationPreferences')} description={t('notificationPreferencesDescription')}>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-card" />
              ))}
            </div>
          ) : error && !preferences ? (
            <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
              {t('loadError')}
            </div>
          ) : preferences?.notifications.length === 0 ? (
            <div className="rounded-lg bg-background px-4 py-3 text-sm text-muted">
              {t('noCategories')}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {preferences?.notifications.map((category) => {
                const someEnabled = category.items.some((item) => item.enabled);

                return (
                  <div key={category.categoryCode} className="py-3">
                    <div className="flex items-center gap-3 px-4">
                      <span className="flex-1 text-sm font-medium text-text-primary">{category.categoryName}</span>
                      <Toggle
                        checked={someEnabled}
                        onChange={(checked) => toggleCategory(category.categoryCode, checked)}
                      />
                    </div>

                    {category.items.length > 1 && (
                      <div className="mt-2 space-y-1 pl-8">
                        {category.items.map((item) => (
                          <div key={item.preferenceId} className="flex items-center gap-3 px-4 py-1.5">
                            <span className="flex-1 text-xs text-text-secondary">
                              {item.subcategoryCode ?? item.categoryCode}
                            </span>
                            <Toggle
                              checked={item.enabled}
                              onChange={(checked) => toggleItem(item.categoryCode, item.subcategoryCode, checked)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </PreferenceSection>

        <PreferenceSection title={t('theme')}>
          {THEME_OPTIONS.map((option) => (
            <SelectableOption
              key={option.value}
              label={option.label}
              description={option.description}
              selected={preferences?.display.theme === option.value}
              onClick={() => setDisplay('theme', option.value)}
            />
          ))}
        </PreferenceSection>

        <PreferenceSection title={t('units')}>
          {UNITS_OPTIONS.map((option) => (
            <SelectableOption
              key={option.value}
              label={option.label}
              description={option.description}
              selected={preferences?.display.units === option.value}
              onClick={() => setDisplay('units', option.value)}
            />
          ))}
        </PreferenceSection>

        {hasChanges && (
          <div className="flex items-center gap-3">
            <button
              onClick={savePreferences}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
            >
              {saving && <IconLoader2 size={16} className="animate-spin" />}
              {saving ? t('saving') : t('save')}
            </button>
            <button
              onClick={cancelChanges}
              disabled={saving}
              className="rounded-lg px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-card disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            {error && (
              <p className="text-sm text-danger">{error}</p>
            )}
          </div>
        )}

        <PreferenceSection title={t('account')}>
          <div className="rounded-lg px-4 py-3">
            <p className="text-sm text-muted">{t('signedInAs')}</p>
            <p className="mt-0.5 text-sm font-medium text-text-primary">{email}</p>
          </div>
          <div className="flex items-center gap-4 px-4 pt-2">
            <button
              onClick={() => signOut()}
              className="rounded-lg bg-danger/10 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/20"
            >
              {ta('signOut')}
            </button>
          </div>
        </PreferenceSection>
      </div>
    </div>
  );
}
