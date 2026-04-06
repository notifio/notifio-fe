'use client';

import { AlertTriangle, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const DISMISSED_KEY = 'notifio_banner_dismissed';
const DEVICE_ID_KEY = 'notifio_device_id';

type Status = {
  hasDevice: boolean;
  geoGranted: boolean;
  geoDenied: boolean;
};

export function LocationStatusBanner() {
  const pathname = usePathname();
  const [status, setStatus] = useState<Status | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Don't show on Settings page itself
    if (pathname?.startsWith('/settings')) {
      setStatus(null);
      return;
    }

    // Respect session dismissal
    if (sessionStorage.getItem(DISMISSED_KEY) === '1') {
      setDismissed(true);
      return;
    }

    const hasDevice = localStorage.getItem(DEVICE_ID_KEY) !== null;

    // Query geolocation permission state
    let cancelled = false;
    const checkGeo = async (): Promise<void> => {
      let geoGranted = false;
      let geoDenied = false;
      if ('permissions' in navigator) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          geoGranted = result.state === 'granted';
          geoDenied = result.state === 'denied';
        } catch {
          // Safari may throw — ignore, show banner conservatively
        }
      }
      if (!cancelled) {
        setStatus({ hasDevice, geoGranted, geoDenied });
      }
    };
    void checkGeo();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const handleDismiss = (): void => {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  if (!status || dismissed) return null;

  const needsPush = !status.hasDevice;
  const needsGeo = !status.geoGranted;

  // Everything is set up — no banner
  if (!needsPush && !needsGeo) return null;

  // Build message based on what's missing
  let message: string;
  if (needsPush && needsGeo) {
    message = 'Zapni push notifikácie a polohu v Settings, aby si dostával relevantné upozornenia.';
  } else if (needsPush) {
    message = 'Zapni push notifikácie v Settings, aby si dostával upozornenia aj keď je stránka zatvorená.';
  } else {
    message = status.geoDenied
      ? 'Poloha je zablokovaná — notifikácie dostaneš len pre uložené lokácie. Zapni ju v nastaveniach prehliadača.'
      : 'Povoľ prístup k polohe v Settings pre relevantné notifikácie vo svojom okolí.';
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-3 md:px-8">
        <AlertTriangle size={18} className="shrink-0 text-amber-600" />
        <p className="flex-1 text-sm text-amber-900">{message}</p>
        <Link
          href="/settings"
          className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-700"
        >
          Otvoriť Settings
        </Link>
        <button
          onClick={handleDismiss}
          className="shrink-0 rounded p-1 text-amber-600 transition-colors hover:bg-amber-100"
          aria-label="Zavrieť"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
