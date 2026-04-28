"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Navbar() {
  const t = useTranslations("nav");

  return (
    <nav className="relative z-10 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
        <Logo size={32} flat title="" />
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
