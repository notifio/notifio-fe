'use client';

import { Bell, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useGeolocationTracker } from '@/hooks/use-geolocation-tracker';
import { useWebPush } from '@/hooks/use-web-push';

export function PushNotificationsToggle() {
  const { permission, deviceId, isLoading, error, enable, disable } = useWebPush();
  const geo = useGeolocationTracker(deviceId);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showGeoPrompt, setShowGeoPrompt] = useState(false);

  // After notifications are enabled, auto-prompt for geolocation (once)
  useEffect(() => {
    if (permission === 'granted' && deviceId && !geo.isTracking && geo.permission === 'prompt') {
      setShowGeoPrompt(true);
    }
  }, [permission, deviceId, geo.isTracking, geo.permission]);

  const handleEnableClick = async () => {
    if (permission === 'denied') {
      setShowInstructions(true);
      return;
    }
    setShowInstructions(true);
  };

  const handleConfirmEnable = async () => {
    setShowInstructions(false);
    await enable();
  };

  const handleDisable = async () => {
    geo.stop();
    await disable();
  };

  const handleEnableGeo = async () => {
    setShowGeoPrompt(false);
    await geo.start();
  };

  if (permission === 'unsupported') {
    return (
      <div className="rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
        Tvoj prehliadač nepodporuje push notifikácie.
      </div>
    );
  }

  if (permission === 'unconfigured') {
    return (
      <div className="rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
        Push notifikácie nie sú nakonfigurované. Kontaktuj administrátora.
      </div>
    );
  }

  const isEnabled = permission === 'granted' && deviceId !== null;

  return (
    <div className="space-y-3">
      {/* Notifications status */}
      <div className="flex items-center gap-3 rounded-lg px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
          <Bell size={16} className="text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Push notifikácie</p>
          <p className="text-xs text-gray-500">
            {isEnabled
              ? 'Dostávaš notifikácie o udalostiach vo svojom okolí'
              : 'Dostávaj notifikácie aj keď je stránka zatvorená'}
          </p>
        </div>
        {isEnabled ? (
          <button
            onClick={handleDisable}
            disabled={isLoading}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
          >
            {isLoading ? 'Vypínam…' : 'Vypnúť'}
          </button>
        ) : (
          <button
            onClick={handleEnableClick}
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Zapínam…' : 'Povoliť'}
          </button>
        )}
      </div>

      {/* Geolocation status (shown only when push is enabled) */}
      {isEnabled && (
        <div className="flex items-center gap-3 rounded-lg px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50">
            <MapPin size={16} className="text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Poloha</p>
            <p className="text-xs text-gray-500">
              {geo.permission === 'granted' && geo.isTracking
                ? 'Notifikácie sa posielajú podľa tvojej aktuálnej polohy'
                : geo.permission === 'denied'
                  ? 'Poloha je zablokovaná — notifikácie len pre uložené lokácie'
                  : 'Povoľ prístup k polohe pre relevantné notifikácie'}
            </p>
          </div>
          {geo.permission !== 'granted' && geo.permission !== 'denied' && (
            <button
              onClick={handleEnableGeo}
              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
            >
              Povoliť
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Chyba: {error}
        </div>
      )}

      {/* Instructions modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900">Povoľ notifikácie v prehliadači</h3>
            <p className="mt-3 text-sm text-gray-600">
              Po kliknutí na <strong>Pokračovať</strong> ti prehliadač zobrazí okno s otázkou, či
              chceš povoliť notifikácie pre túto stránku.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Klikni na <strong>&quot;Povoliť&quot;</strong> v okne prehliadača.
            </p>
            {permission === 'denied' && (
              <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                Notifikácie si predtým zablokoval/a. Musíš ich znovu povoliť v nastaveniach
                prehliadača (ikona zámku v adresnom riadku).
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowInstructions(false)}
                className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                Zrušiť
              </button>
              {permission !== 'denied' && (
                <button
                  onClick={handleConfirmEnable}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Pokračovať
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Geolocation prompt modal */}
      {showGeoPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900">Povoľ prístup k polohe</h3>
            <p className="mt-3 text-sm text-gray-600">
              Aby sme ti vedeli posielať <strong>relevantné notifikácie</strong> o udalostiach v
              tvojom okolí, potrebujeme prístup k tvojej polohe.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Po kliknutí na <strong>Pokračovať</strong> ti prehliadač zobrazí ďalšie okno s
              otázkou — klikni na <strong>&quot;Povoliť&quot;</strong>.
            </p>
            <div className="mt-3 rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
              Ak nepovolíš polohu, budeš dostávať notifikácie len pre lokácie, ktoré si manuálne
              pridáš v nastaveniach.
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowGeoPrompt(false)}
                className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                Nie teraz
              </button>
              <button
                onClick={handleEnableGeo}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
              >
                Pokračovať
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
