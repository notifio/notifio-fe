import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import {
  getSharedMessages,
  defaultLocale,
  supportedLocales,
  type SupportedLocale,
} from "@notifio/shared/i18n";

// Mirror the shared `supportedLocales` so a new locale only needs to be
// added once (in the shared bundle). Prior to PR3 this was hardcoded to
// `['sk', 'en']`; now we accept all six.
const webLocales = supportedLocales;

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
      typeof tv === "object" && !Array.isArray(tv) &&
      typeof sv === "object" && !Array.isArray(sv)
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

export default getRequestConfig(async () => {
  const store = await cookies();
  const cookieLocale = store.get("locale")?.value;

  const locale: SupportedLocale =
    cookieLocale && webLocales.includes(cookieLocale as SupportedLocale)
      ? (cookieLocale as SupportedLocale)
      : defaultLocale;

  // Shared bundle has full sk/en + en-fallback for cs/hu/de/uk.
  const shared = getSharedMessages(locale);

  // Web-local messages: app-specific copy (landing, profile, events, …)
  // not part of the shared cross-app set. cs/hu/de/uk fall back to en
  // until manually translated; en falls back to sk as a last resort.
  let web: Record<string, unknown> = {};
  const webFallbackChain: string[] = [locale, "en", "sk"];
  for (const candidate of webFallbackChain) {
    try {
      web = (await import(`../../messages/${candidate}.json`)).default;
      break;
    } catch {
      // try next candidate
    }
  }

  const messages = deepMerge(shared, web);

  if (process.env.NODE_ENV === "development") {
    const required = ["common", "auth", "settings", "pushSetup", "locationBanner", "map", "alerts", "nav", "landing"];
    const missing = required.filter((ns) => !(ns in messages));
    if (missing.length) {
      console.warn("[i18n] Missing namespaces after merge:", missing);
    }
  }

  return { locale, messages, timeZone: "Europe/Bratislava" };
});
