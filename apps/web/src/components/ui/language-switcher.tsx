"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useTransition } from "react";

import { supportedLocales } from "@notifio/shared/i18n";

import { cn } from "@/lib/utils";

// Source of truth for the locale list lives in @notifio/shared. Adding a
// new language is a one-file change in the shared package.
const LOCALES = supportedLocales;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) return;
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div
      className={cn(
        "flex overflow-hidden rounded-lg border border-border",
        isPending && "opacity-60",
      )}
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          disabled={isPending}
          className={cn(
            "px-2.5 py-1.5 text-xs font-medium transition-colors",
            l === locale
              ? "bg-accent font-semibold text-white"
              : "bg-card text-text-secondary hover:text-text-primary",
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
