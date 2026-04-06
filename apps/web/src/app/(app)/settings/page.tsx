'use client';

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
  const { preferences, isLoading, updatePreferences } = usePreferences();

  const handleToggleCategory = async (preferenceId: string, enabled: boolean) => {
    if (!preferences) return;
    await updatePreferences({
      notifications: [{
        categoryId: preferenceId,
        enabled,
      }],
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 md:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="mt-10 space-y-10">
        <PreferenceSection title="Push notifikácie" description="Zapni push notifikácie aby si dostával upozornenia aj keď je stránka zatvorená.">
          <PushNotificationsToggle />
        </PreferenceSection>

        <PreferenceSection title="Notifications" description="Choose which alert categories you want to receive.">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : preferences?.notifications.map((category) => (
            <div key={category.categoryCode} className="rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex-1 text-sm font-medium text-gray-900">{category.categoryName}</span>
                <Toggle
                  checked={category.items.some((item) => item.enabled)}
                  onChange={(checked) => {
                    const firstItem = category.items[0];
                    if (firstItem) {
                      handleToggleCategory(firstItem.preferenceId, checked);
                    }
                  }}
                />
              </div>
              {category.items.length > 1 && (
                <div className="ml-4 mt-2 space-y-1">
                  {category.items.map((item) => (
                    <div key={item.preferenceId} className="flex items-center gap-3 py-1">
                      <span className="flex-1 text-xs text-gray-600">
                        {item.subcategoryCode ?? item.categoryCode}
                      </span>
                      <Toggle
                        checked={item.enabled}
                        onChange={(checked) => handleToggleCategory(item.preferenceId, checked)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </PreferenceSection>

        <PreferenceSection title="Theme">
          {THEME_OPTIONS.map((option) => (
            <SelectableOption
              key={option.value}
              label={option.label}
              description={option.description}
              selected={preferences?.display.theme === option.value}
              onClick={() => updatePreferences({ display: { theme: option.value } })}
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
              onClick={() => updatePreferences({ display: { units: option.value } })}
            />
          ))}
        </PreferenceSection>

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
