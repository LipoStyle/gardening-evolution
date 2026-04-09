import { CalendarSection } from "@/components/dashboard/CalendarSection";
import { isLocale, type Locale } from "@/i18n/config";

export default async function CalendarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";

  return (
    <div className="FullBleed CalendarLayout">
      <CalendarSection locale={locale} />
    </div>
  );
}

