import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';

const NotificationInitializer = dynamic(
  () => import('@/components/notification-initializer').then((m) => m.NotificationInitializer),
  { ssr: false },
);

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Notifio',
  description: 'Real-time alerts for your location',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NotificationInitializer />
        {children}
      </body>
    </html>
  );
}
