"use client";

import Link from "next/link";
import * as React from "react";
import { localeToLangTag, type Locale } from "@/i18n/config";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function addMonths(year: number, monthIndex: number, delta: number) {
  const d = new Date(year, monthIndex + delta, 1, 12, 0, 0, 0);
  return { year: d.getFullYear(), monthIndex: d.getMonth() };
}

function toIsoDateLocal(year: number, monthIndex: number, day: number) {
  const m = String(monthIndex + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function isSameCalendarDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function MonthPickerModal({
  open,
  year,
  activeMonthIndex,
  onClose,
  onPick,
}: {
  open: boolean;
  year: number;
  activeMonthIndex: number;
  onClose: () => void;
  onPick: (monthIndex: number) => void;
}) {
  if (!open) return null;

  return (
    <div className="MonthModal" role="dialog" aria-modal="true" aria-label="Choose month">
      <button className="MonthModal__backdrop" type="button" onClick={onClose} aria-label="Close month picker" />
      <div className="MonthModal__panel">
        <div className="MonthModal__header">
          <div className="MonthModal__title">Choose month</div>
          <div className="MonthModal__subtitle">{year}</div>
        </div>

        <div className="MonthModal__grid">
          {MONTHS.map((m, idx) => (
            <button
              key={m}
              type="button"
              className={idx === activeMonthIndex ? "MonthModal__month is-active" : "MonthModal__month"}
              onClick={() => {
                onPick(idx);
                onClose();
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CalendarToolbar({
  year,
  monthIndex,
  onPrev,
  onNext,
  onOpenMonthPicker,
}: {
  year: number;
  monthIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onOpenMonthPicker: () => void;
}) {
  return (
    <header className="CalendarToolbar">
      <div className="CalendarToolbar__nav">
        <button type="button" className="CalendarToolbar__arrow" onClick={onPrev} aria-label="Previous month">
          ←
        </button>
        <button type="button" className="CalendarToolbar__month" onClick={onOpenMonthPicker} aria-label="Choose month">
          {MONTHS[monthIndex]} {year}
        </button>
        <button type="button" className="CalendarToolbar__arrow" onClick={onNext} aria-label="Next month">
          →
        </button>
      </div>
    </header>
  );
}

function CalendarMonthGrid({
  year,
  monthIndex,
  locale,
}: {
  year: number;
  monthIndex: number;
  locale: Locale;
}) {
  const lang = localeToLangTag[locale];
  const today = React.useMemo(() => new Date(), []);

  const days = React.useMemo(() => {
    const dim = daysInMonth(year, monthIndex);
    const out: { date: Date; iso: string }[] = [];
    for (let day = 1; day <= dim; day++) {
      const date = new Date(year, monthIndex, day, 12, 0, 0, 0);
      out.push({ date, iso: toIsoDateLocal(year, monthIndex, day) });
    }
    return out;
  }, [year, monthIndex]);

  return (
    <div className="CalendarMonth">
      <div className="CalendarDayGrid" role="list">
        {days.map(({ date, iso }) => {
          const weekday = date.toLocaleDateString(lang, { weekday: "long" });
          const isToday = isSameCalendarDay(date, today);
          return (
            <Link
              key={iso}
              href={`/${locale}/calendar/${iso}`}
              className={isToday ? "DayCard DayCard--today" : "DayCard"}
              role="listitem"
              aria-label={date.toLocaleDateString(lang, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            >
              <div className="DayCard__header">
                <span>{date.getDate()}</span>
                <span className="DayCard__headerLine">{weekday}</span>
              </div>
              <div className="DayCard__body" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function CalendarSection({ locale }: { locale: Locale }) {
  const now = React.useMemo(() => new Date(), []);
  const [year, setYear] = React.useState(now.getFullYear());
  const [monthIndex, setMonthIndex] = React.useState(now.getMonth());
  const [monthPickerOpen, setMonthPickerOpen] = React.useState(false);

  const goPrev = React.useCallback(() => {
    const next = addMonths(year, monthIndex, -1);
    setYear(next.year);
    setMonthIndex(next.monthIndex);
  }, [monthIndex, year]);

  const goNext = React.useCallback(() => {
    const next = addMonths(year, monthIndex, +1);
    setYear(next.year);
    setMonthIndex(next.monthIndex);
  }, [monthIndex, year]);

  return (
    <section className="CalendarSection" aria-label="Calendar">
      <CalendarToolbar
        year={year}
        monthIndex={monthIndex}
        onPrev={goPrev}
        onNext={goNext}
        onOpenMonthPicker={() => setMonthPickerOpen(true)}
      />

      <CalendarMonthGrid year={year} monthIndex={monthIndex} locale={locale} />

      <MonthPickerModal
        open={monthPickerOpen}
        year={year}
        activeMonthIndex={monthIndex}
        onClose={() => setMonthPickerOpen(false)}
        onPick={(m) => setMonthIndex(m)}
      />
    </section>
  );
}
