export const locales = ["en", "el", "de"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeToLangTag: Record<Locale, string> = {
  en: "en",
  el: "el",
  de: "de",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

