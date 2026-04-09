import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, localeToLangTag, type Locale } from "@/i18n/config";

function parseCalendarDateParam(raw: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
  const dt = new Date(y, mo - 1, d, 12, 0, 0, 0);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return { y, m: mo, d };
}

export default async function CalendarDayPage({ params }: { params: Promise<{ locale: string; date: string }> }) {
  const { locale: rawLocale, date: dateParam } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const parsed = parseCalendarDateParam(dateParam);
  if (!parsed) notFound();

  const lang = localeToLangTag[locale];
  const label = new Date(parsed.y, parsed.m - 1, parsed.d, 12, 0, 0, 0).toLocaleDateString(lang, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="CalendarDayPage">
      <h1 className="CalendarDayPage__title">{label}</h1>
      <p className="CalendarDayPage__placeholder">This day view is empty for now. You can add details here later.</p>
      <Link className="CalendarDayPage__back" href={`/${locale}/calendar`}>
        ← Back to calendar
      </Link>
    </div>
  );
}
