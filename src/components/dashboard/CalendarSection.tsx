"use client";

import * as React from "react";

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

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function startOfMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex, 1, 12, 0, 0, 0);
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function weekdayIndexMondayFirst(date: Date) {
  return (date.getDay() + 6) % 7;
}

function addMonths(year: number, monthIndex: number, delta: number) {
  const d = new Date(year, monthIndex + delta, 1, 12, 0, 0, 0);
  return { year: d.getFullYear(), monthIndex: d.getMonth() };
}

function formatDayHeader(d: Date) {
  const dayNum = d.getDate();
  const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
  return `${dayNum} ${dayName}`;
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

function CalendarHeader({
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
    <div className="CalendarHeader">
      <div className="CalendarHeader__nav">
        <button type="button" className="CalendarHeader__arrow" onClick={onPrev} aria-label="Previous month">
          ←
        </button>
        <button type="button" className="CalendarHeader__month" onClick={onOpenMonthPicker} aria-label="Choose month">
          {MONTHS[monthIndex]} {year}
        </button>
        <button type="button" className="CalendarHeader__arrow" onClick={onNext} aria-label="Next month">
          →
        </button>
      </div>
    </div>
  );
}

function CalendarBody({ year, monthIndex }: { year: number; monthIndex: number }) {
  const first = startOfMonth(year, monthIndex);
  const dim = daysInMonth(year, monthIndex);
  const pad = weekdayIndexMondayFirst(first);

  const cells: Array<{ kind: "empty" } | { kind: "day"; date: Date }> = [];
  for (let i = 0; i < pad; i++) cells.push({ kind: "empty" });
  for (let day = 1; day <= dim; day++) cells.push({ kind: "day", date: new Date(year, monthIndex, day, 12, 0, 0, 0) });

  return (
    <div className="CalendarBody">
      <div className="CalendarBody__scroll">
        <div className="CalendarBody__weekdays" aria-hidden="true">
          {WEEKDAYS.map((w) => (
            <div key={w} className="CalendarBody__weekday">
              {w}
            </div>
          ))}
        </div>

        <div className="CalendarGrid">
          {cells.map((cell, idx) =>
            cell.kind === "empty" ? (
              <div key={`e-${idx}`} className="DayCard DayCard--empty" />
            ) : (
              <article key={cell.date.toISOString()} className="DayCard">
                <header className="DayCard__header">{formatDayHeader(cell.date)}</header>
                <div className="DayCard__body" />
              </article>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export function CalendarSection() {
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
    <section className="CalendarSection">
      <CalendarHeader
        year={year}
        monthIndex={monthIndex}
        onPrev={goPrev}
        onNext={goNext}
        onOpenMonthPicker={() => setMonthPickerOpen(true)}
      />

      <CalendarBody year={year} monthIndex={monthIndex} />

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

