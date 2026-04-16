"use client";

import { IconCheck, IconCrown, IconLoader2 } from "@tabler/icons-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { PreferenceSection } from "@/components/app/settings/preference-section";
import { PushNotificationsToggle } from "@/components/app/settings/push-notifications-toggle";
import { DataSourcesSection } from "@/components/settings/data-sources-section";
import { DigestSection } from "@/components/settings/digest-section";
import { NotificationPreferencesSection } from "@/components/settings/notification-preferences-section";
import { PrivacySection } from "@/components/settings/privacy-section";
import { useMembership } from "@/hooks/use-membership";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const t = useTranslations("settings");
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

        <NotificationPreferencesSection />

        <PrivacySection />

        <DataSourcesSection />
      </div>
    </div>
  );
}
