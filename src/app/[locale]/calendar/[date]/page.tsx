import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDayVisitsClient } from "@/components/calendar/CalendarDayVisitsClient";
import { ExtraCard } from "@/components/extras/ExtraCard";
import { isLocale, localeToLangTag, type Locale } from "@/i18n/config";
import { formatEuroFromUnknown } from "@/lib/format";
import { accentForClientId } from "@/lib/clientVisits/calendarData";
import { parseIsoDate, toIsoDateString } from "@/lib/isoDate";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ExtraRowWithClient } from "@/types/extra";
import type { CalendarDayVisitListItem } from "@/types/clientVisit";

function buildClientName(c: { name: string; surname: string }): string {
  return `${c.name} ${c.surname}`.trim() || c.name || c.surname;
}

export default async function CalendarDayPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; date: string }>;
  searchParams: Promise<{ created?: string; visit?: string; error?: string }>;
}) {
  const { locale: rawLocale, date: dateParam } = await params;
  const { created, visit, error } = await searchParams;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const parsed = parseIsoDate(dateParam);
  if (!parsed) notFound();

  const iso = toIsoDateString(parsed);

  const lang = localeToLangTag[locale];
  const label = new Date(parsed.y, parsed.m - 1, parsed.d, 12, 0, 0, 0).toLocaleDateString(lang, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: extrasData }, { data: visitsData }, { data: clientsData }] = await Promise.all([
    supabase
      .from("extras")
      .select("id, client_id, first_name, last_name, display_name, salary, work_date, notes, created_at, updated_at, clients(name,surname)")
      .eq("work_date", iso)
      .order("created_at", { ascending: false }),
    user
      ? supabase
          .from("client_visits")
          .select("id, client_id, visit_date, source, confirmed_at, clients(name, surname)")
          .eq("user_id", user.id)
          .eq("visit_date", iso)
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: null }),
    user
      ? supabase.from("clients").select("id, name, surname").eq("user_id", user.id).order("created_at", { ascending: false })
      : Promise.resolve({ data: null }),
  ]);

  const extras = (extrasData ?? []) as ExtraRowWithClient[];
  const total = extras.reduce((sum, e) => {
    const n = typeof e.salary === "number" ? e.salary : Number.parseFloat(String(e.salary));
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);

  const visitRows = (visitsData ?? []) as {
    id: string;
    client_id: string;
    visit_date: string;
    source: "auto" | "manual";
    confirmed_at: string | null;
    clients: { name: string; surname: string } | { name: string; surname: string }[] | null;
  }[];

  const visits: CalendarDayVisitListItem[] = visitRows.map((row) => {
    const join = Array.isArray(row.clients) ? row.clients[0] : row.clients;
    const displayName = join ? buildClientName(join) : "Client";
    return {
      id: row.id,
      client_id: row.client_id,
      visit_date: row.visit_date,
      source: row.source,
      confirmed_at: row.confirmed_at ?? null,
      displayName,
      accent: accentForClientId(row.client_id),
    };
  });

  const clientOptions =
    (clientsData ?? []).map((c) => ({
      id: (c as { id: string }).id,
      label: buildClientName(c as { name: string; surname: string }),
    })) ?? [];

  return (
    <div className="CalendarDayPage">
      <header className="CalendarDayPage__header">
        <h1 className="CalendarDayPage__title">{label}</h1>
        <p className="CalendarDayPage__subtitle">Client visits, extras, and links for this day.</p>
        {created ? (
          <p className="CalendarDayPage__meta" role="status">
            Extra created successfully.
          </p>
        ) : null}
        {visit === "created" ? (
          <p className="CalendarDayPage__meta" role="status">
            Visit added.
          </p>
        ) : null}
        {visit === "deleted" ? (
          <p className="CalendarDayPage__meta" role="status">
            Visit removed.
          </p>
        ) : null}
        {visit === "confirmed" ? (
          <p className="CalendarDayPage__meta" role="status">
            Visit marked as completed.
          </p>
        ) : null}
        {error ? (
          <p className="CalendarDayPage__meta CalendarDayPage__meta--error" role="alert">
            {error}
          </p>
        ) : null}
      </header>

      <div className="CalendarDayPage__toolbar">
        <Link className="AppHeader__link" href={`/${locale}/extras/new?work_date=${encodeURIComponent(iso)}&from=calendar`}>
          Add extra for this day
        </Link>
        <Link className="AppHeader__link" href={`/${locale}/daily-logs?day=${encodeURIComponent(iso)}`}>
          Daily logs for this day
        </Link>
        <Link className="CalendarDayPage__back" href={`/${locale}/calendar`}>
          ← Back to calendar
        </Link>
      </div>

      <section className="CalendarDayPage__section" aria-labelledby="day-visits-heading">
        <h2 id="day-visits-heading" className="CalendarDayPage__sectionTitle">
          Client visits
        </h2>
        {!user ? (
          <p className="CalendarDayPage__empty">Sign in to view and manage scheduled visits.</p>
        ) : (
          <CalendarDayVisitsClient locale={locale} iso={iso} visits={visits} clientOptions={clientOptions} />
        )}
      </section>

      <section className="CalendarDayPage__section" aria-labelledby="day-extras-heading">
        <h2 id="day-extras-heading" className="CalendarDayPage__sectionTitle">
          Extras
        </h2>
        <p className="CalendarDayPage__summary" aria-live="polite">
          <strong>{extras.length}</strong> {extras.length === 1 ? "extra" : "extras"} · total{" "}
          <strong>{formatEuroFromUnknown(total, locale)}</strong>
        </p>

        {extras.length === 0 ? (
          <p className="CalendarDayPage__empty">No extras for this day yet.</p>
        ) : (
          <div className="ExtraGrid" role="list">
            {extras.map((e) => (
              <div key={e.id} role="listitem">
                <ExtraCard extra={e} locale={locale} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
