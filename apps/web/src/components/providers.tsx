"use client";

import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { NextIntlClientProvider, useLocale } from "next-intl";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

import { ApiProvider } from "@notifio/shared/hooks";

import { ToastProvider } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { makeQueryClient } from "@/lib/query-client";

type Props = {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, unknown>;
};

/**
 * Invalidates every cached query when the active locale changes so each
 * fetch refires with the new `Accept-Language` header. Replaces the
 * implicit locale-in-deps behaviour the prior `useApiQuery` hook had.
 *
 * Mounted inside `<QueryClientProvider>` so `useQueryClient()` resolves,
 * AND inside `<NextIntlClientProvider>` so `useLocale()` resolves.
 * Renders nothing — pure side-effect.
 */
function LocaleInvalidator() {
  const locale = useLocale();
  const queryClient = useQueryClient();
  useEffect(() => {
    void queryClient.invalidateQueries();
  }, [locale, queryClient]);
  return null;
}

export function Providers({ children, locale, messages }: Props) {
  // useState initializer fires once per client mount — keeps a single
  // client across renders without recreating it on every paint.
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Bratislava">
        <QueryClientProvider client={queryClient}>
          <LocaleInvalidator />
          <ApiProvider api={api}>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ApiProvider>
        </QueryClientProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
