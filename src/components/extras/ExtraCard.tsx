import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { formatEuroFromUnknown } from "@/lib/format";
import type { ExtraRowWithClient } from "@/types/extra";
import { DeleteExtraButton } from "@/components/extras/DeleteExtraButton";

function getExtraDisplayName(extra: ExtraRowWithClient) {
  if (extra.display_name) return String(extra.display_name);
  if (extra.client_id && extra.clients) {
    const c = Array.isArray(extra.clients) ? extra.clients[0] : extra.clients;
    if (c) return `${c.name} ${c.surname}`;
  }
  const first = extra.first_name ?? "";
  const last = extra.last_name ?? "";
  return `${first} ${last}`.trim() || "Unknown";
}

export function ExtraCard({ extra, locale }: { extra: ExtraRowWithClient; locale: Locale }) {
  const who = getExtraDisplayName(extra);
  const salary = formatEuroFromUnknown(extra.salary, locale);
  const when = extra.work_date;

  return (
    <article className="ExtraCard">
      <header className="ExtraCard__header">
        <h2 className="ExtraCard__title">{who}</h2>
        <p className="ExtraCard__meta">
          <span className="ExtraCard__date">{when}</span>
          <span className="ExtraCard__dot" aria-hidden="true">
            ·
          </span>
          <span className="ExtraCard__salary">{salary}</span>
        </p>
      </header>

      {extra.notes ? <p className="ExtraCard__notes">{extra.notes}</p> : null}

      <footer className="ExtraCard__footer">
        <Link className="ClientCard__btn" href={`/${locale}/extras/${extra.id}`}>
          View
        </Link>
        <Link className="ClientCard__btn ClientCard__btn--secondary" href={`/${locale}/extras/${extra.id}/edit`}>
          Update
        </Link>
        <DeleteExtraButton locale={locale} extraId={extra.id} extraLabel={`${who} (${when})`} />
      </footer>
    </article>
  );
}

