import { isLocale, type Locale } from "@/i18n/config";
import { messages } from "@/i18n/messages";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";

  return (
    <section className="HomeHero">
      <h1 className="HomeHero__title">{messages[locale].welcome}</h1>
      <p className="HomeHero__subtitle">Multi-language and theme-ready.</p>
    </section>
  );
}

