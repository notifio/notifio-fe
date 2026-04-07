"use client";

import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";

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
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
