import Link from "next/link";
import { signInWithPassword } from "@/app/[locale]/login/actions";
import { isLocale, type Locale } from "@/i18n/config";

export default async function LoginPage({
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
    <section className="AuthCard">
      <h1 className="AuthCard__title">Sign in</h1>
      <p className="AuthCard__hint">Use your Supabase Auth email/password.</p>

      {error ? (
        <div className="AuthCard__error" role="alert">
          {error}
        </div>
      ) : null}

      <form className="AuthForm" action={signInWithPassword}>
        <input type="hidden" name="locale" value={locale} />

        <label className="AuthField">
          <span className="AuthField__label">Email</span>
          <input className="AuthField__input" type="email" name="email" autoComplete="email" required />
        </label>

        <label className="AuthField">
          <span className="AuthField__label">Password</span>
          <input
            className="AuthField__input"
            type="password"
            name="password"
            autoComplete="current-password"
            required
          />
        </label>

        <button className="AuthForm__submit" type="submit">
          Sign in
        </button>
      </form>

      <p className="AuthCard__footer">
        <Link className="AuthCard__link" href={`/${locale}`}>
          Back to home
        </Link>
      </p>
    </section>
  );
}

