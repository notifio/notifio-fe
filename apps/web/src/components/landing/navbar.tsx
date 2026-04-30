"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Navbar() {
  const t = useTranslations("nav");

  return (
    <nav className="relative z-10 flex items-center justify-between">
      {/* Wordmark only — the N-letter mark felt redundant beside the
          word "Notifio" on the landing page (LOGO-2). The authenticated
          TopBar still pairs the mark with the wordmark; this is just
          the marketing-page treatment. */}
      <Link href="/" className="text-lg font-bold text-white">
        <span>Notifio</span>
      </Link>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
        <Button
          variant="ghost"
          size="sm"
          href="/sign-in"
          className="text-white/70 hover:bg-white/10 hover:text-white"
        >
          {t("signIn")}
        </Button>
      </div>
    </nav>
  );
}
