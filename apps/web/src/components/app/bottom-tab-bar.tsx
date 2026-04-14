"use client";

import { IconBell, IconLayoutDashboard, IconMapPin } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

interface TabItem {
  label: string;
  href: string;
  icon: typeof IconLayoutDashboard;
}

interface BottomTabBarProps {
  badgeCount?: number;
}

export function BottomTabBar({ badgeCount }: BottomTabBarProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const tabs: TabItem[] = [
    { label: t("dashboard"), href: "/dashboard", icon: IconLayoutDashboard },
    { label: t("map"), href: "/map", icon: IconMapPin },
    { label: t("notifications"), href: "/notifications", icon: IconBell },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        const Icon = tab.icon;
        const showBadge = tab.href === "/notifications" && badgeCount != null && badgeCount > 0;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2",
              isActive ? "text-accent" : "text-text-secondary",
            )}
          >
            <span className="relative">
              <Icon size={22} />
              {showBadge && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                  {badgeCount}
                </span>
              )}
            </span>
            <span className="text-[10px]">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
