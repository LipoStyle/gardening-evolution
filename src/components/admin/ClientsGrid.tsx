"use client";

import { clients as allClients, avatarFor, type Client } from "@/data/clients";
import styles from "./AdminDashboard.module.css";
import css from "./ClientsGrid.module.css";

export default function ClientsGrid({
  filters,
}: {
  filters: Record<string, string>;
}) {
  const q = (filters.q ?? "").toLowerCase();
  const city = (filters.city ?? "").toLowerCase();

  // Filtering logic (by name/surname/city)
  const clients = allClients.filter((c) => {
    const full = `${c.name} ${c.surname}`.toLowerCase();
    const passName = !q || full.includes(q);
    const passCity = !city || (c.city ?? "").toLowerCase().includes(city);
    return passName && passCity;
  });

  return (
    <div className={`${styles.card} ${css.wrap}`}>
      <div className={css.grid} role="list">
        {clients.map((c, i) => (
          <article
            key={c.id}
            role="listitem"
            className={css.card}
            style={{ animationDelay: `${(i % 8) * 40}ms` }}
          >
            {/* Avatar */}
            <div className={css.avatarWrap}>
              <div className={css.avatar}>
                {avatarFor(c).endsWith(".png") ? (
                  <img
                    src={avatarFor(c)}
                    alt={`${c.name} ${c.surname}`}
                    className={css.avatarImg}
                  />
                ) : (
                  <span className={css.avatarInitials}>{avatarFor(c)}</span>
                )}
              </div>
            </div>

            {/* Client info */}
            <div className={css.meta}>
              <strong className={css.name}>
                {c.name} {c.surname}
              </strong>
              <span className={css.line}>{c.phone || "—"}</span>
              <span className={css.line}>{c.city || "—"}</span>
              <span className={css.fee}>
                {c.monthlyFeeEUR}€ / μήνα
              </span>
            </div>

            {/* Action */}
            <button
              className={css.viewBtn}
              type="button"
              disabled
              title="Open details (coming soon)"
            >
              View
            </button>
          </article>
        ))}

        {clients.length === 0 && (
          <p className={css.empty}>No clients match your filters.</p>
        )}
      </div>
    </div>
  );
}
