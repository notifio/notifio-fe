'use client';

import { signOut } from '@/app/(app)/actions';
import { PreferenceSection } from '@/components/app/settings/preference-section';
import { SelectableOption } from '@/components/ui/selectable-option';
import { Toggle } from '@/components/ui/toggle';
import { usePreferences } from '@/hooks/use-preferences';
import { useSupabaseUser } from '@/hooks/use-supabase-user';
import { ALERT_TYPE_CONFIG, type AlertType } from '@/lib/mock-data';

const SEVERITY_OPTIONS = [
  { value: 'info' as const, label: 'All alerts', description: 'Receive everything including informational updates' },
  { value: 'warning' as const, label: 'Warnings & critical', description: 'Only important and urgent alerts' },
  { value: 'critical' as const, label: 'Critical only', description: 'Only the most urgent alerts' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en' as const, label: 'English' },
  { value: 'sk' as const, label: 'Slovenčina' },
];

export default function SettingsPage() {
  const { email } = useSupabaseUser();
  const { preferences, toggleAlertType, setMinSeverity, setLocale } = usePreferences();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 md:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="mt-10 space-y-10">
        <PreferenceSection title="Notifications" description="Choose which alert types you want to receive.">
          {(Object.entries(ALERT_TYPE_CONFIG) as [AlertType, (typeof ALERT_TYPE_CONFIG)[AlertType]][]).map(
            ([type, config]) => {
              const Icon = config.icon;
              return (
                <div key={type} className="flex items-center gap-3 rounded-lg px-4 py-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: config.bgColor }}
                  >
                    <Icon size={16} color={config.color} />
                  </div>
                  <span className="flex-1 text-sm font-medium text-gray-900">{config.label}</span>
                  <Toggle
                    checked={preferences.alertTypes.includes(type)}
                    onChange={() => toggleAlertType(type)}
                  />
                </div>
              );
            },
          )}
        </PreferenceSection>

        <PreferenceSection title="Minimum Severity">
          {SEVERITY_OPTIONS.map((option) => (
            <SelectableOption
              key={option.value}
              label={option.label}
              description={option.description}
              selected={preferences.minSeverity === option.value}
              onClick={() => setMinSeverity(option.value)}
            />
          ))}
        </PreferenceSection>

        <PreferenceSection title="Language">
          {LANGUAGE_OPTIONS.map((option) => (
            <SelectableOption
              key={option.value}
              label={option.label}
              selected={preferences.locale === option.value}
              onClick={() => setLocale(option.value)}
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
            <button
              // TODO: implement
              onClick={() => {}}
              className="text-sm text-gray-400 transition-colors hover:text-red-500"
            >
              Delete account
            </button>
          </div>
        </PreferenceSection>
      </div>
    </div>
  );
}
