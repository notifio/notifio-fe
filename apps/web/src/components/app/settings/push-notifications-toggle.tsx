'use client';

import { Bell, Check, MapPin, X } from 'lucide-react';
import { useState } from 'react';

import { useGeolocationTracker } from '@/hooks/use-geolocation-tracker';
import { useWebPush } from '@/hooks/use-web-push';

export function PushNotificationsToggle() {
  const { permission, deviceId, isLoading, error, enable, disable } = useWebPush();
  const geo = useGeolocationTracker(deviceId);
  const [showModal, setShowModal] = useState(false);
  const [geoError, setGeoError] = useState(false);

  const handleEnableClick = () => {
    setGeoError(false);
    setShowModal(true);
  };

  const handleGrantGeo = async () => {
    setGeoError(false);
    const ok = await geo.start();
    if (!ok) setGeoError(true);
  };

  const handleGrantPush = async () => {
    await enable();
  };

  const handleDisable = async () => {
    geo.stop();
    await disable();
    setShowModal(false);
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
        Push notifikácie nie sú nakonfigurované.
      </div>
    );
  }

  const pushGranted = permission === 'granted' && deviceId !== null;
  const geoGranted = geo.permission === 'granted';

  return (
    <div className="space-y-3">
      {/* Status row */}
      <div className="flex items-center gap-3 rounded-lg px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
          <Bell size={16} className="text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Push notifikácie</p>
          <p className="text-xs text-gray-500">
            {pushGranted && geoGranted
              ? 'Zapnuté s GPS trackingom'
              : pushGranted
                ? 'Zapnuté (bez GPS — len uložené lokácie)'
                : 'Vypnuté'}
          </p>
        </div>
        {pushGranted ? (
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
            Zapnúť
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Chyba: {error}
        </div>
      )}

      {/* Unified permissions modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-md rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Zapni notifikácie</h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="Zavrieť"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 px-6 py-4">
              {/* GEOLOCATION section */}
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50">
                    {geoGranted ? (
                      <Check size={16} className="text-green-600" />
                    ) : (
                      <MapPin size={16} className="text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">1. Prístup k polohe</p>
                    <p className="mt-1 text-xs text-gray-600">
                      Aby si dostával notifikácie o udalostiach vo svojom okolí. Prehliadač sa
                      opýta — klikni <strong>&quot;Povoliť pri návšteve&quot;</strong>.
                    </p>
                    {geoGranted ? (
                      <p className="mt-2 text-xs font-medium text-green-700">✓ Povolené</p>
                    ) : geo.permission === 'denied' || geoError ? (
                      <div className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
                        Poloha je zamietnutá. Môžeš si pridať lokácie manuálne v sekcii
                        &quot;Uložené lokácie&quot; nižšie v Settings.
                      </div>
                    ) : (
                      <button
                        onClick={handleGrantGeo}
                        className="mt-2 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
                      >
                        Povoliť polohu
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* PUSH section */}
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    {pushGranted ? (
                      <Check size={16} className="text-blue-600" />
                    ) : (
                      <Bell size={16} className="text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">2. Push notifikácie</p>
                    <p className="mt-1 text-xs text-gray-600">
                      Aby si dostával upozornenia aj keď je stránka zatvorená. Prehliadač sa
                      opýta — klikni <strong>&quot;Povoliť&quot;</strong>.
                    </p>
                    {pushGranted ? (
                      <p className="mt-2 text-xs font-medium text-blue-700">✓ Povolené</p>
                    ) : permission === 'denied' ? (
                      <div className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
                        Notifikácie sú zablokované. Povoľ ich v nastaveniach prehliadača (zámok
                        v adresnom riadku).
                      </div>
                    ) : (
                      <button
                        onClick={handleGrantPush}
                        disabled={isLoading}
                        className="mt-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isLoading ? 'Povoľujem…' : 'Povoliť notifikácie'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 px-6 py-3">
              <button
                onClick={() => setShowModal(false)}
                className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                {pushGranted ? 'Hotovo' : 'Zavrieť'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
