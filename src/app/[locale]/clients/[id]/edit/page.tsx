import Link from "next/link";
import { notFound } from "next/navigation";
import { updateClient } from "@/app/[locale]/clients/actions";
import { isLocale, type Locale } from "@/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function EditClientPage({
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

  const { data: client, error: fetchErr } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchErr || !client) {
    notFound();
  }

  const salaryStr =
    typeof client.monthly_salary === "number" ? String(client.monthly_salary) : String(client.monthly_salary ?? "");

  return (
    <section className="AuthCard ClientsForm">
      <h1 className="AuthCard__title">Edit client</h1>
      <p className="AuthCard__hint">Update details for {client.name} {client.surname}.</p>

      {error ? (
        <div className="AuthCard__error" role="alert">
          {error}
        </div>
      ) : null}

      <form className="AuthForm" action={updateClient}>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="id" value={client.id} />

        <label className="AuthField">
          <span className="AuthField__label">Name</span>
          <input className="AuthField__input" type="text" name="name" defaultValue={client.name} required />
        </label>

        <label className="AuthField">
          <span className="AuthField__label">Surname</span>
          <input className="AuthField__input" type="text" name="surname" defaultValue={client.surname} required />
        </label>

        <label className="AuthField">
          <span className="AuthField__label">Mobile number</span>
          <input className="AuthField__input" type="tel" name="mobile" defaultValue={client.mobile} required />
        </label>

        <label className="AuthField">
          <span className="AuthField__label">City</span>
          <input className="AuthField__input" type="text" name="city" defaultValue={client.city} required />
        </label>

        <label className="AuthField">
          <span className="AuthField__label">Monthly salary (EUR)</span>
          <input
            className="AuthField__input"
            type="number"
            name="monthly_salary"
            min="0"
            step="0.01"
            inputMode="decimal"
            defaultValue={salaryStr}
            placeholder="0.00"
            required
            aria-describedby="edit-monthly-salary-hint"
          />
          <span id="edit-monthly-salary-hint" className="AuthField__hint">
            Gross amount per month, in euros (€).
          </span>
        </label>

        <button className="AuthForm__submit" type="submit">
          Save changes
        </button>
      </form>

      <p className="AuthCard__footer">
        <Link className="AuthCard__link" href={`/${locale}/clients/${id}`}>
          View client
        </Link>
        {" · "}
        <Link className="AuthCard__link" href={`/${locale}/clients`}>
          All clients
        </Link>
      </p>
    </section>
  );
}
