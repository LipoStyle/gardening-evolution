"use client";

import * as React from "react";
import {
  confirmCalendarDayVisit,
  createManualCalendarVisit,
  deleteCalendarDayVisit,
} from "@/app/[locale]/calendar/[date]/visitActions";
import type { Locale } from "@/i18n/config";
import type { CalendarDayVisitListItem } from "@/types/clientVisit";

type Props = {
  locale: Locale;
  iso: string;
  visits: CalendarDayVisitListItem[];
  clientOptions: { id: string; label: string }[];
};

export function CalendarDayVisitsClient({ locale, iso, visits, clientOptions }: Props) {
  const [pending, startTransition] = React.useTransition();

  return (
    <div className="CalendarDayVisits">
      {visits.length === 0 ? (
        <p className="CalendarDayVisits__empty">No visits scheduled for this day.</p>
      ) : (
        <ul className="CalendarDayVisits__list" role="list">
          {visits.map((v) => (
            <li key={v.id} className="CalendarDayVisitRow" role="listitem">
              <div
                className="CalendarDayVisitRow__chip"
                style={{ ["--visit-accent" as string]: v.accent }}
              >
                <span className="CalendarDayVisitRow__name">{v.displayName}</span>
                <div className="CalendarDayVisitRow__meta">
                  {v.confirmed_at ? (
                    <span className="CalendarDayVisitRow__badge CalendarDayVisitRow__badge--done">Completed</span>
                  ) : null}
                  <span className="CalendarDayVisitRow__badge">
                    {v.source === "manual" ? "Manual" : "Planned"}
                  </span>
                </div>
              </div>
              <div className="CalendarDayVisitRow__actions">
                {!v.confirmed_at ? (
                  <button
                    type="button"
                    className="ClientCard__btn ClientCard__btn--secondary"
                    disabled={pending}
                    onClick={() => {
                      const ok = window.confirm(
                        `Confirm you completed the visit to "${v.displayName}" on this day?`
                      );
                      if (!ok) return;
                      startTransition(() => {
                        const fd = new FormData();
                        fd.set("locale", locale);
                        fd.set("visit_id", v.id);
                        fd.set("visit_date", iso);
                        void confirmCalendarDayVisit(fd);
                      });
                    }}
                  >
                    Confirm visit
                  </button>
                ) : null}
                <button
                  type="button"
                  className="ClientCard__btn ClientCard__btn--danger"
                  disabled={pending}
                  onClick={() => {
                    const ok = window.confirm(
                      `Remove this visit for "${v.displayName}"? It will not be auto-added back for this client on this date.`
                    );
                    if (!ok) return;
                    startTransition(() => {
                      const fd = new FormData();
                      fd.set("locale", locale);
                      fd.set("visit_id", v.id);
                      fd.set("visit_date", iso);
                      void deleteCalendarDayVisit(fd);
                    });
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {clientOptions.length > 0 ? (
        <form className="CalendarDayVisitForm" action={createManualCalendarVisit}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="visit_date" value={iso} />
          <div className="CalendarDayVisitForm__row">
            <label className="CalendarDayVisitForm__field">
              <span className="CalendarDayVisitForm__label">Add visit manually</span>
              <select name="client_id" className="AuthField__input" required defaultValue="">
                <option value="" disabled>
                  Select client…
                </option>
                {clientOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="ClientCard__btn">
              Add visit
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
