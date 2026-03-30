import Link from "next/link";
import { createClient } from "@/app/[locale]/clients/actions";
import { isLocale, type Locale } from "@/i18n/config";

export default async function NewClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const { error } = await searchParams;

  return (
    <section className="AuthCard ClientsForm">
      <h1 className="AuthCard__title">New client</h1>
      <p className="AuthCard__hint">Add a client record. More fields can be added later.</p>

      {error ? (
        <div className="AuthCard__error" role="alert">
          {error}
        </div>
      ) : null}

      <form className="AuthForm" action={createClient}>
        <input type="hidden" name="locale" value={locale} />

        <label className="AuthField">
          <span className="AuthField__label">Name</span>
          <input className="AuthField__input" type="text" name="name" autoComplete="given-name" required />
        </label>

        <label className="AuthField">
          <span className="AuthField__label">Surname</span>
          <input className="AuthField__input" type="text" name="surname" autoComplete="family-name" required />
        </label>

        <label className="AuthField">
          <span className="AuthField__label">Mobile number</span>
          <input className="AuthField__input" type="tel" name="mobile" autoComplete="tel" required />
        </label>

        <label className="AuthField">
          <span className="AuthField__label">City</span>
          <input className="AuthField__input" type="text" name="city" autoComplete="address-level2" required />
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
            placeholder="0.00"
            required
            aria-describedby="monthly-salary-hint"
          />
          <span id="monthly-salary-hint" className="AuthField__hint">
            Gross amount per month, in euros (€).
          </span>
        </label>

        <button className="AuthForm__submit" type="submit">
          Create client
        </button>
      </form>

      <p className="AuthCard__footer">
        <Link className="AuthCard__link" href={`/${locale}/clients`}>
          ← Back to clients
        </Link>
      </p>
    </section>
  );
}
