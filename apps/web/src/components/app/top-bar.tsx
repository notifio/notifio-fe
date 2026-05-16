"use client";

import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconCrown,
  IconLanguage,
  IconLogout,
  IconMoon,
  IconSettings,
  IconSun,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState, useTransition } from "react";

import { supportedLocales } from "@notifio/shared/i18n";

import { signOut } from "@/app/(app)/actions";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { cn } from "@/lib/utils";

// Display names for the language drill-down. Skipping flag emojis —
// cross-platform rendering is unreliable (Windows tofu boxes, mobile
// variation). The shared package only exposes the locale array.
const LANGUAGE_NAMES: Record<string, string> = {
  sk: "Slovenčina",
  en: "English",
  cs: "Čeština",
  de: "Deutsch",
  hu: "Magyar",
  uk: "Українська",
};

type MenuView = "main" | "language";

export function TopBar() {
  const { name, email } = useSupabaseUser();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const { resolvedTheme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState<MenuView>("main");
  const [mounted, setMounted] = useState(false);
  const [, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  // next-themes returns undefined on the server; guard the icon swap
  // so the SSR/CSR markup matches and we don't get a hydration mismatch.
  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { label: t("nav.dashboard"), href: "/dashboard" },
    { label: t("nav.weather"), href: "/weather" },
    { label: t("nav.map"), href: "/map" },
    { label: t("nav.notifications"), href: "/notifications" },
  ];

  const initial = name?.charAt(0).toUpperCase() ?? "?";
  const isDark = resolvedTheme === "dark";

  // Close on outside click + Escape. Resets the sub-view too so the
  // menu opens back at "main" next time.
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setMenuView("main");
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setMenuView("main");
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  // Cookie + refresh — same mechanism the standalone LanguageSwitcher
  // uses (still consumed by landing/navbar). Inlined here so we don't
  // have to render that component just to call its handler.
  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) return;
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
    startTransition(() => {
      router.refresh();
    });
    setMenuOpen(false);
    setMenuView("main");
  };

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center border-b border-border bg-background px-4 md:px-6">
      {/* Wordmark only — the N-letter mark felt redundant beside the
          word "Notifio" everywhere on web (LOGO-2 follow-up).
          Mobile keeps the brand mark; web is wordmark-only. */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-lg font-bold text-accent"
      >
        <span>Notifio</span>
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
        {/* Profile dropdown — language + theme + nav links + sign out
            all live here now. Inline pills + theme button removed from
            the header to declutter on lg+ widths. */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => {
              setMenuOpen((v) => !v);
              setMenuView("main");
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {initial}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 min-w-[240px] overflow-hidden rounded-xl border border-border bg-background shadow-lg">
              {menuView === "language" ? (
                <>
                  <button
                    onClick={() => setMenuView("main")}
                    className="flex w-full items-center gap-2 border-b border-border px-3 py-2.5 text-xs text-muted transition-colors hover:bg-card hover:text-text-primary"
                  >
                    <IconChevronLeft size={14} />
                    {t("nav.languageBack")}
                  </button>
                  <div className="py-1">
                    {supportedLocales.map((l) => (
                      <button
                        key={l}
                        onClick={() => switchLocale(l)}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                          l === locale
                            ? "bg-accent/10 text-accent"
                            : "text-text-secondary hover:bg-card hover:text-text-primary",
                        )}
                      >
                        <span className="flex-1 text-left">
                          {LANGUAGE_NAMES[l] ?? l.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted">{l.toUpperCase()}</span>
                        {l === locale && <IconCheck size={14} />}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
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

                  {/* Language + theme */}
                  <div className="border-b border-border py-1">
                    <button
                      onClick={() => setMenuView("language")}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-card hover:text-text-primary"
                    >
                      <IconLanguage size={16} />
                      <span className="flex-1 text-left">{t("nav.language")}</span>
                      <span className="text-xs text-muted">{locale.toUpperCase()}</span>
                      <IconChevronRight size={14} className="text-muted" />
                    </button>
                    <button
                      onClick={toggleTheme}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-card hover:text-text-primary"
                    >
                      {mounted && isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
                      <span className="flex-1 text-left">{t("nav.theme")}</span>
                      <span className="text-xs text-muted">
                        {mounted ? t(`nav.themeMode.${isDark ? "dark" : "light"}`) : ""}
                      </span>
                    </button>
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

                  {/* Sign out */}
                  <div className="border-t border-border py-1">
                    <button
                      onClick={() => signOut()}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10"
                    >
                      <IconLogout size={16} />
                      {t("auth.signOut")}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
