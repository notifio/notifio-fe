"use client";

import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";

import { ToastProvider } from "@/components/ui/toast";

type Props = {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, unknown>;
};

export function Providers({ children, locale, messages }: Props) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Bratislava">
        <ToastProvider>
          {children}
        </ToastProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
