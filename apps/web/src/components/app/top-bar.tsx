"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { signOut } from "@/app/(app)/actions";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { cn } from "@/lib/utils";

export function TopBar() {
  const { name } = useSupabaseUser();
  const pathname = usePathname();
  const t = useTranslations();

  const navItems = [
    { label: t("nav.dashboard"), href: "/dashboard" },
    { label: t("nav.settings"), href: "/settings" },
  ];

  const initial = name?.charAt(0).toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center border-b border-border bg-background px-4 md:px-6">
      <Link href="/dashboard" className="text-lg font-bold text-accent">
        Notifio
      </Link>

      <nav className="ml-4 flex items-center gap-1 md:ml-8">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-2 py-1.5 text-sm font-medium transition-colors md:px-3",
                isActive
                  ? "bg-card text-accent"
                  : "text-text-secondary hover:bg-card hover:text-text-primary",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-medium text-white">
            {initial}
          </div>
          <span className="hidden text-sm font-medium text-text-primary md:inline">
            {name}
          </span>
        </div>
        <button
          onClick={() => signOut()}
          className="hidden rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:bg-card hover:text-text-primary sm:inline-flex"
        >
          {t("auth.signOut")}
        </button>
      </div>
    </header>
  );
}
