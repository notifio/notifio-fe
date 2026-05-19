import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Single source of truth: every translation lives in `@notifio/shared/i18n`.
// `getSharedMessages(locale)` returns the pre-bundled message map for the
// requested locale (falls back to default for unsupported codes).
//
// Mobile-local locale files used to live under `./locales/*.json` and merge
// over shared via deepMerge, but every mobile key was a duplicate of a
// shared key (some drifted, mostly identical). The local files were deleted
// after the i18n sync — net change behaviourally is that ~7 drifted strings
// now match the shared copy. Add mobile-only namespaces back here only if
// shared genuinely doesn't cover them.
import {
  getSharedMessages,
  supportedLocales,
  defaultLocale,
} from '@notifio/shared/i18n';

type SupportedLocale = (typeof supportedLocales)[number];

// Mobile-only override layer. Keys live under namespaces that shared
// does not own (`localTabs.*`, `localEmpty.*`), so the merge below
// passes them through with no risk of shared overriding them. Mirrors
// the web-local `apps/web/messages/*.json` augmentation pattern.
//
// TODO: migrate these to @notifio/shared in the next shared bump and
// delete this MOBILE_OVERRIDES block + the override merge step.
type DeepStringRecord = { [key: string]: string | DeepStringRecord };
const MOBILE_OVERRIDES: Record<SupportedLocale, DeepStringRecord> = {
  sk: {
    localTabs: { hlasenia: 'Hlásenia' },
    localEmpty: {
      noReports: {
        title: 'Žiadne hlásenia',
        subtitle: 'Pridaj nové hlásenie z mapy',
        openMap: 'Otvoriť mapu',
      },
    },
  },
  en: {
    localTabs: { hlasenia: 'Reports' },
    localEmpty: {
      noReports: {
        title: 'No reports yet',
        subtitle: 'Add a new report from the map',
        openMap: 'Open map',
      },
    },
  },
  cs: {
    localTabs: { hlasenia: 'Hlášení' },
    localEmpty: {
      noReports: {
        title: 'Žádná hlášení',
        subtitle: 'Přidej hlášení z mapy',
        openMap: 'Otevřít mapu',
      },
    },
  },
  de: {
    localTabs: { hlasenia: 'Meldungen' },
    localEmpty: {
      noReports: {
        title: 'Keine Meldungen',
        subtitle: 'Füge eine Meldung über die Karte hinzu',
        openMap: 'Karte öffnen',
      },
    },
  },
  hu: {
    localTabs: { hlasenia: 'Bejelentések' },
    localEmpty: {
      noReports: {
        title: 'Nincsenek bejelentések',
        subtitle: 'Adj hozzá bejelentést a térképről',
        openMap: 'Térkép megnyitása',
      },
    },
  },
  uk: {
    localTabs: { hlasenia: 'Звіти' },
    localEmpty: {
      noReports: {
        title: 'Немає звітів',
        subtitle: 'Додайте звіт з мапи',
        openMap: 'Відкрити мапу',
      },
    },
  },
};

function deepMerge<T extends Record<string, unknown>>(target: T, source: DeepStringRecord): T {
  const out: Record<string, unknown> = { ...target };
  for (const [key, value] of Object.entries(source)) {
    const existing = out[key];
    if (
      value && typeof value === 'object' && !Array.isArray(value) &&
      existing && typeof existing === 'object' && !Array.isArray(existing)
    ) {
      out[key] = deepMerge(existing as Record<string, unknown>, value as DeepStringRecord);
    } else {
      out[key] = value;
    }
  }
  return out as T;
}

// Build i18next resources from shared + mobile overrides. Overrides
// win on collision, but the new namespaces (`localTabs`, `localEmpty`)
// don't currently exist in shared so there are no collisions today.
const resources = supportedLocales.reduce<Record<string, { translation: Record<string, unknown> }>>(
  (acc, loc) => {
    const shared = getSharedMessages(loc) as Record<string, unknown>;
    acc[loc] = { translation: deepMerge(shared, MOBILE_OVERRIDES[loc]) };
    return acc;
  },
  {},
);

/** AsyncStorage key for the user-selected locale. Must match what
 *  `setLocale()` writes and what the boot bootstrapping reads. */
export const LOCALE_STORAGE_KEY = 'notifio.locale';

// Detect device language; fall back to the project default if the device
// reports something we don't ship copy for. Used as the immediate i18next
// `lng` so first paint isn't blocked on AsyncStorage; if the user picked a
// different locale previously, `bootstrapLocale()` swaps it in once the
// async read finishes.
const deviceLocale = getLocales()[0]?.languageCode ?? defaultLocale;
const initialLng: SupportedLocale = (supportedLocales as readonly string[]).includes(deviceLocale)
  ? (deviceLocale as SupportedLocale)
  : defaultLocale;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLng,
    // Two-step fallback: missing keys fall through en first (international
    // baseline), then sk (canonical source). Mirrors the BE `tFallback`
    // chain so the same key behaves the same way on every platform.
    fallbackLng: ['en', 'sk'],
    interpolation: { escapeValue: false },
  });


/**
 * Read the user's previously-selected locale from AsyncStorage and apply
 * it to i18next. No-op when nothing's stored or the stored value isn't a
 * supported locale. Call this once at app boot from a top-level layout.
 *
 * Kept fire-and-forget on purpose so the first render isn't blocked on
 * the AsyncStorage read; users see device-locale copy for one frame and
 * then the persisted choice.
 */
export async function bootstrapLocale(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
    if (!stored) return;
    if ((supportedLocales as readonly string[]).includes(stored)) {
      if (i18n.language !== stored) {
        await i18n.changeLanguage(stored);
      }
    }
  } catch {
    // AsyncStorage failure is non-critical — keep the device-detected locale.
  }
}

/**
 * Persist the user's locale pick to AsyncStorage and apply it immediately
 * via i18next. The mobile LanguageSwitcher calls this; the next app boot
 * picks the same value back up via `bootstrapLocale()`.
 *
 * Passing `null` clears the explicit override so the app re-resolves the
 * device default — same logic as a fresh install with no AsyncStorage
 * value. Used by the picker's "Use country default" option.
 */
export async function setLocale(locale: string | null): Promise<void> {
  if (locale === null) {
    try {
      await AsyncStorage.removeItem(LOCALE_STORAGE_KEY);
    } catch {
      // Same recoverability story — clearing failure isn't fatal.
    }
    const device = getLocales()[0]?.languageCode ?? defaultLocale;
    const fallback: SupportedLocale = (supportedLocales as readonly string[]).includes(device)
      ? (device as SupportedLocale)
      : defaultLocale;
    await i18n.changeLanguage(fallback);
    return;
  }
  if (!(supportedLocales as readonly string[]).includes(locale)) return;
  await i18n.changeLanguage(locale);
  try {
    await AsyncStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Persistence failure is recoverable — current session still uses the
    // new locale; the next boot just falls back to device-detected.
  }
}

/**
 * Read the explicit locale override (or `null` if the user is following
 * the device default). The picker uses this to mark the right row as
 * selected — `i18n.language` alone can't distinguish "explicitly chose
 * sk" from "device is sk, no override".
 */
export async function getStoredLocale(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export default i18n;
