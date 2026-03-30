import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { formatEuroFromUnknown } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: client, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !client) {
    notFound();
  }

  const salary = formatEuroFromUnknown(client.monthly_salary, locale);

  return (
    <section className="HomeHero ClientDetail">
      <h1 className="HomeHero__title">
        {client.name} {client.surname}
      </h1>
      <p className="HomeHero__subtitle">{client.city}</p>

      <dl className="ClientDetail__dl">
        <div className="ClientDetail__row">
          <dt>Mobile</dt>
          <dd>{client.mobile}</dd>
        </div>
        <div className="ClientDetail__row">
          <dt>Monthly salary (EUR)</dt>
          <dd>{salary}</dd>
        </div>
        <div className="ClientDetail__row">
          <dt>Created</dt>
          <dd>{new Date(client.created_at).toLocaleString()}</dd>
        </div>
      </dl>

      <p className="ClientDetail__actions">
        <Link className="AppHeader__link" href={`/${locale}/clients/${id}/edit`}>
          Edit client
        </Link>
      </p>

      <p style={{ marginTop: 16 }}>
        <Link href={`/${locale}/clients`}>← Back to clients</Link>
      </p>
    </section>
  );
}
