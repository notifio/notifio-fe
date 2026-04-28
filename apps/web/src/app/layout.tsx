import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getLocale, getMessages } from "next-intl/server";

import { FirebaseErrorSuppressor } from "@/components/firebase-error-suppressor";
import { Providers } from "@/components/providers";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Notifio",
  description: "Real-time alerts for your location",
  // `app/icon.svg` is automatically picked up by Next.js as the favicon,
  // but we list it explicitly so social-card crawlers and the apple-touch
  // path can reuse the same asset without falling back to defaults.
  icons: {
    icon: "/icon",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Notifio",
    description: "Real-time alerts for your location",
    images: [{ url: "/logo.svg", width: 1024, height: 1024, alt: "Notifio" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers locale={locale} messages={messages}>
          <FirebaseErrorSuppressor />
          {children}
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
