"use client";

import { useState } from "react";
import styles from "./AdminDashboard.module.css";
import ControlPanel from "./ControlPanel";
import ContextBar from "./ContextBar";
import ClientsGrid from "./ClientsGrid";

export type SectionKey = "clients" | "calendar" | "extras" | "tools" | "medicines";

export default function DashboardLayout() {
  // default is clients
  const [active, setActive] = useState<SectionKey>("clients");
  const [filters, setFilters] = useState<Record<string, string>>({});

  return (
    <main className={styles.grid}>
      {/* SECTION 1 — dashboard actions */}
      <aside className={styles.section1}>
        <ControlPanel active={active} onChange={setActive} />
      </aside>

      {/* SECTION 2 — context bar (filters/controls based on active) */}
      <section className={styles.section2}>
        <ContextBar active={active} filters={filters} onChange={setFilters} />
      </section>

      {/* SECTION 3 — content area (default: clients grid) */}
      <section className={styles.section3}>
        {active === "clients" && <ClientsGrid filters={filters} />}
        {active === "calendar" && (
          <div className={styles.card} style={{ padding: "1rem" }}>
            <h2>Calendar</h2>
            <p>[Calendar UI placeholder]</p>
          </div>
        )}
        {active === "extras" && (
          <div className={styles.card} style={{ padding: "1rem" }}>
            <h2>Extras</h2>
            <p>[Extras tools placeholder]</p>
          </div>
        )}
        {active === "tools" && (
          <div className={styles.card} style={{ padding: "1rem" }}>
            <h2>Tools</h2>
            <p>[Tools inventory placeholder]</p>
          </div>
        )}
        {active === "medicines" && (
          <div className={styles.card} style={{ padding: "1rem" }}>
            <h2>Medicines</h2>
            <p>[Pesticides / fertilizers placeholder]</p>
          </div>
        )}
      </section>
    </main>
  );
}
