import Link from "next/link";
import { createExtra } from "@/app/[locale]/extras/actions";
import { isLocale, type Locale } from "@/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ClientRow } from "@/types/client";

export default async function NewExtraPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const { error } = await searchParams;

  const supabase = await createSupabaseServerClient();
  const { data: clientsData } = await supabase.from("clients").select("id, name, surname").order("created_at", { ascending: false });
  const clients = (clientsData ?? []) as Pick<ClientRow, "id" | "name" | "surname">[];

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  return (
    <section className="AuthCard ExtrasForm">
      <h1 className="AuthCard__title">New extra</h1>
      <p className="AuthCard__hint">Create an extra income entry for a client or a one-off person.</p>

      {error ? (
        <div className="AuthCard__error" role="alert">
          {error}
        </div>
      ) : null}

      <form className="AuthForm" action={createExtra}>
        <input type="hidden" name="locale" value={locale} />

        <label className="AuthField">
          <span className="AuthField__label">Existing client (optional)</span>
          <select className="AuthField__input" name="client_id" defaultValue="">
            <option value="">— Not a client —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.surname}
              </option>
            ))}
          </select>
          <span className="AuthField__hint">
            If you select a client, the name/surname fields below must be left empty.
          </span>
        </label>

        <div className="ExtrasForm__person">
          <label className="AuthField">
            <span className="AuthField__label">First name (only if not a client)</span>
            <input className="AuthField__input" type="text" name="first_name" autoComplete="given-name" />
          </label>

          <label className="AuthField">
            <span className="AuthField__label">Last name (only if not a client)</span>
            <input className="AuthField__input" type="text" name="last_name" autoComplete="family-name" />
          </label>
        </div>

        <label className="AuthField">
          <span className="AuthField__label">Salary (EUR)</span>
          <input
            className="AuthField__input"
            type="number"
            name="salary"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="0.00"
            required
          />
        </label>

        <label className="AuthField">
          <span className="AuthField__label">Date</span>
          <input className="AuthField__input" type="date" name="work_date" defaultValue={todayStr} required />
        </label>

        <label className="AuthField">
          <span className="AuthField__label">Notes</span>
          <textarea className="AuthField__input ExtrasForm__notes" name="notes" rows={4} placeholder="Describe what you did…" />
        </label>

        <button className="AuthForm__submit" type="submit">
          Create extra
        </button>
      </form>

      <p className="AuthCard__footer">
        <Link className="AuthCard__link" href={`/${locale}/extras`}>
          ← Back to extras
        </Link>
      </p>
    </section>
  );
}

