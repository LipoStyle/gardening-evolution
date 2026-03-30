import type { Locale } from "@/i18n/config";

const currencyLocaleByAppLocale: Record<Locale, string> = {
  en: "en-IE",
  el: "el-GR",
  de: "de-DE",
};

export function formatEuro(amount: number, locale: Locale): string {
  const tag = currencyLocaleByAppLocale[locale];
  return new Intl.NumberFormat(tag, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatEuroFromUnknown(value: unknown, locale: Locale): string {
  const n = typeof value === "number" ? value : Number.parseFloat(String(value));
  if (!Number.isFinite(n)) return String(value);
  return formatEuro(n, locale);
}
