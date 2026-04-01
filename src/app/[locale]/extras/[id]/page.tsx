import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { formatEuroFromUnknown } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ExtraRowWithClient } from "@/types/extra";

function displayName(extra: ExtraRowWithClient) {
  if (extra.display_name) return String(extra.display_name);
  if (extra.client_id && extra.clients) {
    const c = Array.isArray(extra.clients) ? extra.clients[0] : extra.clients;
    if (c) return `${c.name} ${c.surname}`;
  }
  return `${extra.first_name ?? ""} ${extra.last_name ?? ""}`.trim() || "Unknown";
}

export default async function ExtraDetailPage({
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

  const { data: extra, error } = await supabase
    .from("extras")
    .select(
      "id, client_id, first_name, last_name, display_name, salary, work_date, notes, created_at, updated_at, clients(name,surname)"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !extra) {
    notFound();
  }

  const who = displayName(extra as ExtraRowWithClient);
  const salary = formatEuroFromUnknown((extra as ExtraRowWithClient).salary, locale);

  return (
    <section className="HomeHero ExtraDetail">
      <h1 className="HomeHero__title">{who}</h1>
      <p className="HomeHero__subtitle">Extra income entry</p>

      <dl className="ClientDetail__dl">
        <div className="ClientDetail__row">
          <dt>Date</dt>
          <dd>{(extra as ExtraRowWithClient).work_date}</dd>
        </div>
        <div className="ClientDetail__row">
          <dt>Salary (EUR)</dt>
          <dd>{salary}</dd>
        </div>
        {(extra as ExtraRowWithClient).notes ? (
          <div className="ClientDetail__row">
            <dt>Notes</dt>
            <dd style={{ whiteSpace: "pre-wrap" }}>{(extra as ExtraRowWithClient).notes}</dd>
          </div>
        ) : null}
        <div className="ClientDetail__row">
          <dt>Created</dt>
          <dd>{new Date((extra as ExtraRowWithClient).created_at).toLocaleString()}</dd>
        </div>
      </dl>

      <p className="ClientDetail__actions">
        <Link className="AppHeader__link" href={`/${locale}/extras/${id}/edit`}>
          Edit extra
        </Link>
      </p>

      <p style={{ marginTop: 16 }}>
        <Link href={`/${locale}/extras`}>← Back to extras</Link>
      </p>
    </section>
  );
}

