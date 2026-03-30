import Link from "next/link";
import { DeleteClientButton } from "@/components/clients/DeleteClientButton";
import type { Locale } from "@/i18n/config";
import { formatEuroFromUnknown } from "@/lib/format";
import type { ClientRow } from "@/types/client";

type Props = {
  client: ClientRow;
  locale: Locale;
};

export function ClientCard({ client, locale }: Props) {
  const salary = formatEuroFromUnknown(client.monthly_salary, locale);

  return (
    <article className="ClientCard">
      <header className="ClientCard__header">
        <h2 className="ClientCard__title">
          {client.name} {client.surname}
        </h2>
        <p className="ClientCard__city">{client.city}</p>
      </header>
      <div className="ClientCard__body">
        <p className="ClientCard__line">
          <span className="ClientCard__label">Mobile</span>
          <span>{client.mobile}</span>
        </p>
        <p className="ClientCard__line">
          <span className="ClientCard__label">Monthly salary (EUR)</span>
          <span>{salary}</span>
        </p>
      </div>
      <footer className="ClientCard__footer">
        <Link className="ClientCard__btn" href={`/${locale}/clients/${client.id}`}>
          View
        </Link>
        <Link className="ClientCard__btn ClientCard__btn--secondary" href={`/${locale}/clients/${client.id}/edit`}>
          Update
        </Link>
        <DeleteClientButton
          locale={locale}
          clientId={client.id}
          clientLabel={`${client.name} ${client.surname}`}
        />
      </footer>
    </article>
  );
}
