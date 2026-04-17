'use client';

import { IconBell, IconLoader2 } from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import type { NotificationCategoryResponse } from '@notifio/api-client';

import { PreferenceSection } from '@/components/app/settings/preference-section';
import { Toggle } from '@/components/ui/toggle';
import { usePreferences } from '@/hooks/use-preferences';
import { CATEGORY_GROUPS } from '@/lib/category-groups';

interface ResolvedGroup {
  groupKey: string;
  groupLabel: string;
  icon: Icon;
  categories: NotificationCategoryResponse[];
}

export function NotificationPreferencesSection() {
  const t = useTranslations('settings');
  const tg = useTranslations('categoryGroups');
  const {
    preferences,
    isLoading,
    saving,
    error,
    hasChanges,
    toggleCategory,
    savePreferences,
    cancelChanges,
  } = usePreferences();

  const { groups, ungrouped } = useMemo(() => {
    if (!preferences)
      return {
        groups: [] as ResolvedGroup[],
        ungrouped: [] as NotificationCategoryResponse[],
      };

    const matched = new Set<string>();
    const resolved: ResolvedGroup[] = [];

    for (const def of CATEGORY_GROUPS) {
      const cats = preferences.notifications.filter((c) =>
        def.categoryCodes.includes(c.categoryCode),
      );
      if (cats.length === 0) continue;
      for (const c of cats) matched.add(c.categoryCode);
      resolved.push({
        groupKey: def.groupKey,
        groupLabel: tg(def.groupKey),
        icon: def.icon,
        categories: cats,
      });
    }

    const remaining = preferences.notifications.filter(
      (c) => !matched.has(c.categoryCode),
    );

    return { groups: resolved, ungrouped: remaining };
  }, [preferences, tg]);

  const toggleGroup = (group: ResolvedGroup, enabled: boolean) => {
    for (const cat of group.categories) {
      toggleCategory(cat.categoryCode, enabled);
    }
  };

  return (
    <>
      <PreferenceSection
        title={t('notificationPreferences')}
        description={t('notificationPreferencesDescription')}
      >
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-xl bg-card"
              />
            ))}
          </div>
        ) : error && !preferences ? (
          <div className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
            {t('loadError')}
          </div>
        ) : groups.length === 0 && ungrouped.length === 0 ? (
          <div className="rounded-xl bg-card px-4 py-3 text-sm text-muted">
            {t('noCategories')}
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => {
              const GroupIcon = group.icon;
              const allItems = group.categories.flatMap((c) => c.items);
              const someEnabled = allItems.some((i) => i.enabled);
              const firstCategory = group.categories[0];
              const isSingleFlat =
                group.categories.length === 1 &&
                firstCategory != null &&
                firstCategory.items.length <= 1;

              return (
                <div key={group.groupKey} className="rounded-xl bg-card">
                  {isSingleFlat && firstCategory != null ? (
                    <div className="flex min-h-[44px] items-center gap-3 px-4 py-3">
                      <GroupIcon
                        size={20}
                        className="shrink-0 text-accent"
                      />
                      <span className="flex-1 text-sm font-medium text-text-primary">
                        {firstCategory.categoryName}
                      </span>
                      <Toggle
                        checked={someEnabled}
                        onChange={(checked) =>
                          toggleCategory(
                            firstCategory.categoryCode,
                            checked,
                          )
                        }
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex min-h-[44px] items-center gap-3 px-4 py-3">
                        <GroupIcon
                          size={20}
                          className="shrink-0 text-accent"
                        />
                        <span className="flex-1 text-sm font-semibold text-text-primary">
                          {group.groupLabel}
                        </span>
                        <Toggle
                          checked={someEnabled}
                          onChange={(checked) =>
                            toggleGroup(group, checked)
                          }
                        />
                      </div>
                      <div className="divide-y divide-border border-t border-border">
                        {group.categories.map((cat) => {
                          const catEnabled = cat.items.some(
                            (i) => i.enabled,
                          );
                          return (
                            <div
                              key={cat.categoryCode}
                              className="flex min-h-[44px] items-center gap-3 px-4 py-2 pl-11"
                            >
                              <span className="flex-1 text-sm text-text-secondary">
                                {cat.categoryName}
                              </span>
                              <Toggle
                                checked={catEnabled}
                                onChange={(checked) =>
                                  toggleCategory(
                                    cat.categoryCode,
                                    checked,
                                  )
                                }
                              />
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {ungrouped.map((cat) => {
              const catEnabled = cat.items.some((i) => i.enabled);
              return (
                <div key={cat.categoryCode} className="rounded-xl bg-card">
                  <div className="flex min-h-[44px] items-center gap-3 px-4 py-3">
                    <IconBell size={20} className="shrink-0 text-accent" />
                    <span className="flex-1 text-sm font-medium text-text-primary">
                      {cat.categoryName}
                    </span>
                    <Toggle
                      checked={catEnabled}
                      onChange={(checked) =>
                        toggleCategory(cat.categoryCode, checked)
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PreferenceSection>

      {hasChanges && (
        <div className="flex flex-wrap items-center gap-3">
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
          {error && <p className="w-full text-sm text-danger">{error}</p>}
        </div>
      )}
    </>
  );
}
