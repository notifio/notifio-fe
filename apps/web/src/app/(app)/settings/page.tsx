"use client";

import { IconBell, IconCheck, IconCrown, IconLoader2 } from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import type { NotificationCategoryResponse } from "@notifio/api-client";

import { PreferenceSection } from "@/components/app/settings/preference-section";
import { PushNotificationsToggle } from "@/components/app/settings/push-notifications-toggle";
import { DataSourcesSection } from "@/components/settings/data-sources-section";
import { DigestSection } from "@/components/settings/digest-section";
import { PrivacySection } from "@/components/settings/privacy-section";
import { Toggle } from "@/components/ui/toggle";
import { useMembership } from "@/hooks/use-membership";
import { usePreferences } from "@/hooks/use-preferences";
import { api } from "@/lib/api";
import { CATEGORY_GROUPS } from "@/lib/category-groups";

interface ResolvedGroup {
  groupKey: string;
  groupLabel: string;
  icon: Icon;
  categories: NotificationCategoryResponse[];
}

export default function SettingsPage() {
  const t = useTranslations("settings");
  const tg = useTranslations("categoryGroups");
  const tm = useTranslations("membership");
  const { membership, isLoading: membershipLoading, isFree } = useMembership();
  const [portalLoading, setPortalLoading] = useState(false);

  const handleOpenPortal = async () => {
    setPortalLoading(true);
    try {
      const response = await api.createPortalSession({
        returnUrl: window.location.href,
      });
      if (!response?.url) {
        throw new Error('No portal URL returned');
      }
      window.location.href = response.url;
    } catch {
      setPortalLoading(false);
    }
  };
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
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-8 md:py-10">
      <h1 className="text-2xl font-bold text-text-primary">{t("title")}</h1>

      <div className="mt-8 space-y-8 md:mt-10">
        {/* Subscription */}
        <PreferenceSection
          title={tm("settingsTitle")}
          description={tm("settingsDescription")}
        >
          {membershipLoading ? (
            <div className="h-24 animate-pulse rounded-xl bg-card" />
          ) : membership ? (
            <div className="rounded-xl bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10">
                  <IconCrown size={18} className="text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">
                      {membership.current.name}
                    </span>
                    {!isFree && (
                      <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
                        {tm("active")}
                      </span>
                    )}
                  </div>
                  {membership.current.priceMonthly !== "0.00" && (
                    <p className="text-xs text-muted">
                      €{membership.current.priceMonthly}{tm("perMonth")}
                    </p>
                  )}
                </div>
              </div>

              {(() => {
                const tierFeatures: string[] = tm.raw(`tiers.${membership.current.tier}.features`) as string[];
                const displayFeatures = tierFeatures?.slice(0, 5) ?? [];
                return displayFeatures.length > 0 ? (
                  <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
                    {displayFeatures.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-xs text-text-secondary">
                        <IconCheck size={14} className="mt-0.5 shrink-0 text-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                ) : null;
              })()}

              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
                {isFree ? (
                  <Link
                    href="/pricing"
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
                  >
                    {tm("upgrade")}
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={handleOpenPortal}
                      disabled={portalLoading}
                      className="inline-flex items-center gap-2 rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
                    >
                      {portalLoading && <IconLoader2 size={14} className="animate-spin" />}
                      {tm("manage")}
                    </button>
                    <button
                      onClick={handleOpenPortal}
                      disabled={portalLoading}
                      className="rounded-lg px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
                    >
                      {tm("cancelPlan")}
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </PreferenceSection>

        {/* Push Notifications */}
        <PreferenceSection
          title={t("pushNotifications")}
          description={t("pushDescription")}
        >
          <div className="rounded-xl bg-card p-4">
            <PushNotificationsToggle />
          </div>
        </PreferenceSection>

        <DigestSection />

        {/* Notification Preferences */}
        <PreferenceSection
          title={t("notificationPreferences")}
          description={t("notificationPreferencesDescription")}
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
              {t("loadError")}
            </div>
          ) : groups.length === 0 && ungrouped.length === 0 ? (
            <div className="rounded-xl bg-card px-4 py-3 text-sm text-muted">
              {t("noCategories")}
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
                      /* Single-category flat row */
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
                        {/* Multi-category group header with master toggle */}
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

                        {/* Category rows */}
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

              {/* Ungrouped fallback cards */}
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

        {/* Save / Cancel */}
        {hasChanges && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={savePreferences}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
            >
              {saving && <IconLoader2 size={16} className="animate-spin" />}
              {saving ? t("saving") : t("save")}
            </button>
            <button
              onClick={cancelChanges}
              disabled={saving}
              className="rounded-lg px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-card disabled:opacity-50"
            >
              {t("cancel")}
            </button>
            {error && <p className="w-full text-sm text-danger">{error}</p>}
          </div>
        )}

        <PrivacySection />

        <DataSourcesSection />
      </div>
    </div>
  );
}
