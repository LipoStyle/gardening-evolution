"use client";

import type { SectionKey } from "./DashboardLayout";
import styles from "./AdminDashboard.module.css";
import css from "./ContextBar.module.css";

export default function ContextBar({
  active,
  filters,
  onChange,
}: {
  active: SectionKey;
  filters: Record<string, string>;
  onChange: (f: Record<string, string>) => void;
}) {
  function update(key: string, value: string) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className={`${styles.card} ${css.bar}`}>
      {active === "clients" && (
        <div className={css.row}>
          <input
            className={css.input}
            placeholder="Search by name…"
            value={filters.q ?? ""}
            onChange={(e) => update("q", e.target.value)}
          />
          <input
            className={css.input}
            placeholder="Filter by city…"
            value={filters.city ?? ""}
            onChange={(e) => update("city", e.target.value)}
          />
        </div>
      )}

      {active === "calendar" && (
        <div className={css.row}>
          <input
            className={css.input}
            type="date"
            value={filters.date ?? ""}
            onChange={(e) => update("date", e.target.value)}
          />
          <select
            className={css.select}
            value={filters.view ?? "month"}
            onChange={(e) => update("view", e.target.value)}
          >
            <option value="month">Month</option>
            <option value="week">Week</option>
            <option value="day">Day</option>
          </select>
        </div>
      )}

      {(active === "extras" || active === "tools" || active === "medicines") && (
        <div className={css.row}>
          <span className={css.helper}>No filters for this section yet.</span>
        </div>
      )}
    </div>
  );
}
