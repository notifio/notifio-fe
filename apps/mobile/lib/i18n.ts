import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Use the package's public i18n export rather than reaching into
// `dist/...json` directly. `getSharedMessages(locale)` returns the
// pre-bundled message map for the requested locale and falls back to
// the default if the locale is unsupported. This keeps the import
// surface aligned with the package's `"exports"` field.
import {
  getSharedMessages,
  supportedLocales,
  defaultLocale,
} from '@notifio/shared/i18n';

// Mobile-only locale files (app-specific copy: tabs, onboarding,
// permissions, screens, etc.). cs/hu/de/uk start as en copies and are
// translated manually over time; the `fallbackLng` chain below catches
// any keys that drift out of parity. Imports kept alphabetical to
// satisfy `import/order`; the resource map below restores logical
// locale ordering.
import mobileCs from '../locales/cs.json';
import mobileDe from '../locales/de.json';
import mobileEn from '../locales/en.json';
import mobileHu from '../locales/hu.json';
import mobileSk from '../locales/sk.json';
import mobileUk from '../locales/uk.json';

type LocaleMap = Record<string, unknown>;
type SupportedLocale = (typeof supportedLocales)[number];

function deepMerge(target: LocaleMap, source: LocaleMap): LocaleMap {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const tv = target[key];
    const sv = source[key];
    if (
      tv && sv &&
      typeof tv === 'object' && !Array.isArray(tv) &&
      typeof sv === 'object' && !Array.isArray(sv)
    ) {
      result[key] = deepMerge(tv as LocaleMap, sv as LocaleMap);
    } else {
      result[key] = sv;
    }
  }
  return result;
}

const mobileByLocale: Record<SupportedLocale, LocaleMap> = {
  sk: mobileSk as LocaleMap,
  en: mobileEn as LocaleMap,
  cs: mobileCs as LocaleMap,
  hu: mobileHu as LocaleMap,
  de: mobileDe as LocaleMap,
  uk: mobileUk as LocaleMap,
};

// Build i18next resources by merging shared (cross-app) + mobile (app-
// specific) for every supported locale.
const resources = supportedLocales.reduce<Record<string, { translation: LocaleMap }>>((acc, loc) => {
  const shared = getSharedMessages(loc);
  acc[loc] = { translation: deepMerge(shared, mobileByLocale[loc]) };
  return acc;
}, {});

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
