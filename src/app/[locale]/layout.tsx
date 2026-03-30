import { Header } from "@/components/Header";
import { defaultLocale, isLocale, localeToLangTag, type Locale } from "@/i18n/config";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  return (
    <div className="AppShell" lang={localeToLangTag[locale]}>
      <Header locale={locale} />
      <main className="AppMain">{children}</main>
    </div>
  );
}

