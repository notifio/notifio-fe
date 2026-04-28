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
// any keys that drift out of parity.
import mobileSk from '../locales/sk.json';
import mobileEn from '../locales/en.json';
import mobileCs from '../locales/cs.json';
import mobileHu from '../locales/hu.json';
import mobileDe from '../locales/de.json';
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

// Detect device language; fall back to the project default if the device
// reports something we don't ship copy for.
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

export default i18n;
