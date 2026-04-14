import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Shared locale files (imported directly — the barrel export uses
// `import ... with { type: "json" }` which Metro doesn't support)
import sharedEn from '@notifio/shared/dist/i18n/en.json';
import sharedSk from '@notifio/shared/dist/i18n/sk.json';

// Mobile-only locale files
import mobileEn from '../locales/en.json';
import mobileSk from '../locales/sk.json';

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const tv = target[key];
    const sv = source[key];
    if (
      tv && sv &&
      typeof tv === 'object' && !Array.isArray(tv) &&
      typeof sv === 'object' && !Array.isArray(sv)
    ) {
      result[key] = deepMerge(
        tv as Record<string, unknown>,
        sv as Record<string, unknown>,
      );
    } else {
      result[key] = sv;
    }
  }
  return result;
}

const resources = {
  sk: { translation: deepMerge(sharedSk as Record<string, unknown>, mobileSk as Record<string, unknown>) },
  en: { translation: deepMerge(sharedEn as Record<string, unknown>, mobileEn as Record<string, unknown>) },
};

// Detect device language, fall back to sk
const deviceLocale = getLocales()[0]?.languageCode ?? 'sk';
const supportedLng = deviceLocale in resources ? deviceLocale : 'sk';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: supportedLng,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
