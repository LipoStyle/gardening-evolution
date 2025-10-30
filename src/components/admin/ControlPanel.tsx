"use client";

import styles from "./AdminDashboard.module.css";
import css from "./ControlPanel.module.css";
import type { SectionKey } from "./DashboardLayout";

const items: { key: SectionKey; label: string }[] = [
  { key: "clients", label: "Clients" },
  { key: "calendar", label: "Calendar" },
  { key: "extras", label: "Extras" },
  { key: "tools", label: "Tools" },
  { key: "medicines", label: "Medicines" },
];

export default function ControlPanel({
  active,
  onChange,
}: {
  active: SectionKey;
  onChange: (key: SectionKey) => void;
}) {
  return (
    <nav className={`${styles.card} ${css.wrap}`} aria-label="Dashboard actions">
      <h2 className={css.title}>Dashboard</h2>
      <ul className={css.list}>
        {items.map((it) => (
          <li key={it.key}>
            <button
              type="button"
              className={`${css.item} ${active === it.key ? css.active : ""}`}
              onClick={() => onChange(it.key)}
              aria-current={active === it.key ? "page" : undefined}
            >
              {it.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
