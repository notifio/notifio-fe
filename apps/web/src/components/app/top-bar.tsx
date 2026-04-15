"use client";

import { IconCrown, IconLogout, IconSettings, IconUser } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { signOut } from "@/app/(app)/actions";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { cn } from "@/lib/utils";

export function TopBar() {
  const { name, email } = useSupabaseUser();
  const pathname = usePathname();
  const t = useTranslations();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { label: t("nav.dashboard"), href: "/dashboard" },
    { label: t("nav.map"), href: "/map" },
    { label: t("nav.notifications"), href: "/notifications" },
  ];

  const initial = name?.charAt(0).toUpperCase() ?? "?";

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center border-b border-border bg-background px-4 md:px-6">
      <Link href="/dashboard" className="text-lg font-bold text-accent">
        Notifio
      </Link>

      <nav className="ml-4 hidden items-center gap-1 md:flex md:ml-8">
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
        <div className="hidden lg:flex lg:items-center lg:gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        {/* Profile dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {initial}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 min-w-[200px] overflow-hidden rounded-xl border border-border bg-background shadow-lg">
              {/* Header */}
              <div className="border-b border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-medium text-white">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {name}
                    </p>
                    <p className="truncate text-xs text-muted">{email}</p>
                  </div>
                </div>
              </div>

              {/* Language & theme — visible below lg */}
              <div className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>

              {/* Menu items */}
              <div className="py-1">
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-card hover:text-text-primary"
                >
                  <IconUser size={16} />
                  {t("nav.profile")}
                </Link>
                <Link
                  href="/pricing"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-card hover:text-text-primary"
                >
                  <IconCrown size={16} />
                  {t("nav.pricing")}
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-card hover:text-text-primary"
                >
                  <IconSettings size={16} />
                  {t("nav.settings")}
                </Link>
              </div>

              {/* Divider + sign out */}
              <div className="border-t border-border py-1">
                <button
                  onClick={() => signOut()}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10"
                >
                  <IconLogout size={16} />
                  {t("auth.signOut")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
