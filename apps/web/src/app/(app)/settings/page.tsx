"use client";

import { useTranslations } from "next-intl";

import { AboutSection } from "@/components/settings/about-section";
import { DataSourcesSection } from "@/components/settings/data-sources-section";
import { DigestSection } from "@/components/settings/digest-section";
import { NotificationPreferencesSection } from "@/components/settings/notification-preferences-section";
import { PermissionsSection } from "@/components/settings/permissions-section";
import { PrivacySection } from "@/components/settings/privacy-section";
import { QuietHoursSection } from "@/components/settings/quiet-hours-section";
import { SubscriptionSection } from "@/components/settings/subscription-section";

export default function SettingsPage() {
  const t = useTranslations("settings");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-8 md:py-10">
      <h1 className="text-2xl font-bold text-text-primary">{t("title")}</h1>

      <div className="mt-8 space-y-8 md:mt-10">
        <SubscriptionSection />
        <PermissionsSection />
        <NotificationPreferencesSection />
        <DigestSection />
        <QuietHoursSection />
        <DataSourcesSection />
        <PrivacySection />
        <AboutSection />
      </div>
    </div>
  );
}
