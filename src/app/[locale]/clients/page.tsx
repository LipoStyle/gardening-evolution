import Link from "next/link";
import { isLocale, type Locale } from "@/i18n/config";
import { ClientCard } from "@/components/clients/ClientCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ClientRow } from "@/types/client";

export default async function ClientsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ created?: string; updated?: string; deleted?: string; error?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const { created, updated, deleted, error } = await searchParams;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let clients: ClientRow[] = [];
  if (user) {
    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    clients = (data ?? []) as ClientRow[];
  }

  return (
    <div className="ClientsPage">
      <section className="HomeHero ClientsPage__intro">
        <h1 className="HomeHero__title">Clients</h1>
        <p className="HomeHero__subtitle">Manage your clients.</p>

        {created ? (
          <p className="HomeHero__meta" role="status">
            Client created successfully.
          </p>
        ) : null}
        {updated ? (
          <p className="HomeHero__meta" role="status">
            Client updated successfully.
          </p>
        ) : null}
        {deleted ? (
          <p className="HomeHero__meta" role="status">
            Client deleted.
          </p>
        ) : null}
        {error ? (
          <p className="AuthCard__error" role="alert" style={{ marginTop: 12 }}>
            {error}
          </p>
        ) : null}

        <div className="ClientsPage__toolbar">
          <Link className="AppHeader__link" href={`/${locale}/clients/new`}>
            Create new client
          </Link>
          <Link className="ClientsPage__backDash" href={`/${locale}/dashboard`}>
            ← Back to dashboard
          </Link>
        </div>
      </section>

      {clients.length === 0 ? (
        <p className="ClientsPage__empty">No clients yet. Create one to get started.</p>
      ) : (
        <div className="ClientGrid" role="list">
          {clients.map((c) => (
            <div key={c.id} role="listitem">
              <ClientCard client={c} locale={locale} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
