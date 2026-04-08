import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { getSharedMessages, defaultLocale, type SupportedLocale } from "@notifio/shared/i18n";

const webLocales = ["sk", "en"] as const;

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
    cookieLocale && webLocales.includes(cookieLocale as (typeof webLocales)[number])
      ? (cookieLocale as SupportedLocale)
      : defaultLocale;

  const shared = getSharedMessages(locale);

  let web: Record<string, unknown> = {};
  try {
    web = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    web = (await import(`../../messages/${defaultLocale}.json`)).default;
  }

  const messages = deepMerge(shared, web);

  return { locale, messages, timeZone: "Europe/Bratislava" };
});
