const WEEKDAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
] as const;

type Props = {
  defaultVisitsPerMonth?: number;
  defaultPreferredWeekdays?: number[] | null;
};

export function VisitScheduleFields({ defaultVisitsPerMonth = 1, defaultPreferredWeekdays = null }: Props) {
  const vis = Math.min(4, Math.max(1, Math.round(defaultVisitsPerMonth) || 1));
  const pref = new Set(defaultPreferredWeekdays ?? []);

  return (
    <>
      <label className="AuthField">
        <span className="AuthField__label">Visits per month</span>
        <select className="AuthField__input" name="visits_per_month" defaultValue={String(vis)} aria-describedby="visits-per-month-hint">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
        <span id="visits-per-month-hint" className="AuthField__hint">
          The calendar balances everyone across the month (max ~3 clients per day). With preferred weekdays, visits stay on
          those days when possible. Without preferred days, visits use open slots with pseudo-random ties.
        </span>
      </label>

      <fieldset className="ClientsForm__weekdaysFieldset">
        <legend className="AuthField__label">Preferred weekdays (optional)</legend>
        <p className="AuthField__hint" style={{ marginTop: 0, marginBottom: 10 }}>
          Leave all unchecked to auto-space visits across the month. Check one or more to only schedule on those weekdays.
        </p>
        <div className="ClientsForm__weekdays" role="group" aria-label="Preferred weekdays">
          {WEEKDAYS.map(({ value, label }) => (
            <label key={value} className="ClientsForm__weekday">
              <input
                className="ClientsForm__weekdayInput"
                type="checkbox"
                name="preferred_weekday"
                value={String(value)}
                defaultChecked={pref.has(value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );
}
