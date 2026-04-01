import Link from "next/link";
import { notFound } from "next/navigation";
import { updateExtra } from "@/app/[locale]/extras/actions";
import { isLocale, type Locale } from "@/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ClientRow } from "@/types/client";
import type { ExtraRowWithClient } from "@/types/extra";

export default async function EditExtraPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale: rawLocale, id } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const { error } = await searchParams;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const [{ data: extra, error: fetchErr }, { data: clientsData }] = await Promise.all([
    supabase
      .from("extras")
      .select(
        "id, client_id, first_name, last_name, display_name, salary, work_date, notes, created_at, updated_at, clients(name,surname)"
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("clients").select("id, name, surname").order("created_at", { ascending: false }),
  ]);

  if (fetchErr || !extra) {
    notFound();
  }

  const clients = (clientsData ?? []) as Pick<ClientRow, "id" | "name" | "surname">[];
  const row = extra as ExtraRowWithClient;
  const salaryStr = typeof row.salary === "number" ? String(row.salary) : String(row.salary ?? "");

  return (
    <section className="AuthCard ExtrasForm">
      <h1 className="AuthCard__title">Edit extra</h1>
      <p className="AuthCard__hint">Update this extra income entry.</p>

      {error ? (
        <div className="AuthCard__error" role="alert">
          {error}
        </div>
      ) : null}

      <form className="AuthForm" action={updateExtra}>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="id" value={row.id} />

        <label className="AuthField">
          <span className="AuthField__label">Existing client (optional)</span>
          <select className="AuthField__input" name="client_id" defaultValue={row.client_id ?? ""}>
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
            <input className="AuthField__input" type="text" name="first_name" defaultValue={row.first_name ?? ""} />
          </label>

          <label className="AuthField">
            <span className="AuthField__label">Last name (only if not a client)</span>
            <input className="AuthField__input" type="text" name="last_name" defaultValue={row.last_name ?? ""} />
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
            defaultValue={salaryStr}
            placeholder="0.00"
            required
          />
        </label>

        <label className="AuthField">
          <span className="AuthField__label">Date</span>
          <input className="AuthField__input" type="date" name="work_date" defaultValue={row.work_date} required />
        </label>

        <label className="AuthField">
          <span className="AuthField__label">Notes</span>
          <textarea
            className="AuthField__input ExtrasForm__notes"
            name="notes"
            rows={4}
            defaultValue={row.notes ?? ""}
            placeholder="Describe what you did…"
          />
        </label>

        <button className="AuthForm__submit" type="submit">
          Save changes
        </button>
      </form>

      <p className="AuthCard__footer">
        <Link className="AuthCard__link" href={`/${locale}/extras/${id}`}>
          View extra
        </Link>
        {" · "}
        <Link className="AuthCard__link" href={`/${locale}/extras`}>
          All extras
        </Link>
      </p>
    </section>
  );
}

