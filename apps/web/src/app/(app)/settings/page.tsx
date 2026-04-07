'use client';

import { Loader2 } from 'lucide-react';

import { signOut } from '@/app/(app)/actions';
import { PreferenceSection } from '@/components/app/settings/preference-section';
import { PushNotificationsToggle } from '@/components/app/settings/push-notifications-toggle';
import { SelectableOption } from '@/components/ui/selectable-option';
import { Toggle } from '@/components/ui/toggle';
import { usePreferences } from '@/hooks/use-preferences';
import { useSupabaseUser } from '@/hooks/use-supabase-user';

const THEME_OPTIONS = [
  { value: 'system' as const, label: 'System', description: 'Follow your device settings' },
  { value: 'light' as const, label: 'Light' },
  { value: 'dark' as const, label: 'Dark' },
];

const UNITS_OPTIONS = [
  { value: 'metric' as const, label: 'Metric', description: '°C, km/h, mm' },
  { value: 'imperial' as const, label: 'Imperial', description: '°F, mph, in' },
];

export default function SettingsPage() {
  const { email } = useSupabaseUser();
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
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="mt-10 space-y-10">
        <PreferenceSection title="Push Notifications" description="Enable push notifications to receive alerts even when the page is closed.">
          <PushNotificationsToggle />
        </PreferenceSection>

        <PreferenceSection title="Notification Preferences" description="Choose which alert categories you want to receive.">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : error && !preferences ? (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              Failed to load preferences. Please try again later.
            </div>
          ) : preferences?.notifications.length === 0 ? (
            <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">
              No notification categories available.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {preferences?.notifications.map((category) => {
                const someEnabled = category.items.some((item) => item.enabled);

                return (
                  <div key={category.categoryCode} className="py-3">
                    <div className="flex items-center gap-3 px-4">
                      <span className="flex-1 text-sm font-medium text-gray-900">{category.categoryName}</span>
                      <Toggle
                        checked={someEnabled}
                        onChange={(checked) => toggleCategory(category.categoryCode, checked)}
                      />
                    </div>

                    {category.items.length > 1 && (
                      <div className="mt-2 space-y-1 pl-8">
                        {category.items.map((item) => (
                          <div key={item.preferenceId} className="flex items-center gap-3 px-4 py-1.5">
                            <span className="flex-1 text-xs text-gray-600">
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

        <PreferenceSection title="Theme">
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

        <PreferenceSection title="Units">
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
              className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-50"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button
              onClick={cancelChanges}
              disabled={saving}
              className="rounded-lg px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
        )}

        <PreferenceSection title="Account">
          <div className="rounded-lg px-4 py-3">
            <p className="text-sm text-gray-500">Signed in as</p>
            <p className="mt-0.5 text-sm font-medium text-gray-900">{email}</p>
          </div>
          <div className="flex items-center gap-4 px-4 pt-2">
            <button
              onClick={() => signOut()}
              className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
            >
              Sign out
            </button>
          </div>
        </PreferenceSection>
      </div>
    </div>
  );
}
