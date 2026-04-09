import Link from "next/link";
import { isLocale, type Locale } from "@/i18n/config";
import { formatEuroFromUnknown } from "@/lib/format";
import { currentMonthRange, monthRangeFrom, yearRangeFrom } from "@/lib/monthRange";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ClientRow } from "@/types/client";
import type { ExtraRowWithClient } from "@/types/extra";
import { ExtraCard } from "@/components/extras/ExtraCard";

function getDisplayName(extra: ExtraRowWithClient) {
  if (extra.display_name) return String(extra.display_name);
  if (extra.client_id && extra.clients) {
    const c = Array.isArray(extra.clients) ? extra.clients[0] : extra.clients;
    if (c) return `${c.name} ${c.surname}`;
  }
  const first = extra.first_name ?? "";
  const last = extra.last_name ?? "";
  return `${first} ${last}`.trim();
}

export default async function ExtrasPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    created?: string;
    updated?: string;
    deleted?: string;
    error?: string;
    year?: string;
    month?: string; // YYYY-MM
    day?: string; // YYYY-MM-DD
    q?: string; // client/person name search
  }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const { created, updated, deleted, error, year, month, day, q } = await searchParams;

  const supabase = await createSupabaseServerClient();

  // Determine date filter (default current month)
  let range: { start: string; end: string } = currentMonthRange();
  let activeLabel = "Current month";

  if (day) {
    range = { start: day, end: day };
    activeLabel = day;
  } else if (month) {
    const r = monthRangeFrom(month);
    if (r) {
      range = r;
      activeLabel = month;
    }
  } else if (year) {
    const r = yearRangeFrom(year);
    if (r) {
      range = r;
      activeLabel = year;
    }
  }

  const { data } = await supabase
    .from("extras")
    .select(
      "id, client_id, first_name, last_name, display_name, salary, work_date, notes, created_at, updated_at, clients(name,surname)"
    )
    .gte("work_date", range.start)
    .lte("work_date", range.end)
    .order("work_date", { ascending: false });

  let extras = (data ?? []) as ExtraRowWithClient[];

  const query = String(q ?? "").trim().toLowerCase();
  // Fast path: filter in SQL if display_name exists in DB.
  // If display_name isn't present yet, the SQL filter will fail; in that case, apply the README SQL first.
  if (query) {
    const { data: filtered, error: filterErr } = await supabase
      .from("extras")
      .select(
        "id, client_id, first_name, last_name, display_name, salary, work_date, notes, created_at, updated_at, clients(name,surname)"
      )
      .gte("work_date", range.start)
      .lte("work_date", range.end)
      .ilike("display_name", `%${query}%`)
      .order("work_date", { ascending: false });
    if (!filterErr) {
      extras = (filtered ?? []) as ExtraRowWithClient[];
    } else {
      extras = extras.filter((e) => getDisplayName(e).toLowerCase().includes(query));
    }
  }

  // For the "client name" filter help text, we can show current client list size.
  const { data: clientsData } = await supabase.from("clients").select("id, name, surname").order("created_at", { ascending: false });
  const clients = (clientsData ?? []) as Pick<ClientRow, "id" | "name" | "surname">[];

  const total = extras.reduce((sum, e) => {
    const n = typeof e.salary === "number" ? e.salary : Number.parseFloat(String(e.salary));
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);

  return (
    <div className="ExtrasPage">
      <section className="HomeHero ExtrasPage__intro">
        <h1 className="HomeHero__title">Extras</h1>
        <p className="HomeHero__subtitle">Track extra income jobs (client or non-client).</p>

        {created ? (
          <p className="HomeHero__meta" role="status">
            Extra created successfully.
          </p>
        ) : null}
        {updated ? (
          <p className="HomeHero__meta" role="status">
            Extra updated successfully.
          </p>
        ) : null}
        {deleted ? (
          <p className="HomeHero__meta" role="status">
            Extra deleted.
          </p>
        ) : null}
        {error ? (
          <p className="AuthCard__error" role="alert" style={{ marginTop: 12 }}>
            {error}
          </p>
        ) : null}

        <div className="ExtrasPage__toolbar">
          <Link className="AppHeader__link" href={`/${locale}/extras/new`}>
            Create new extra
          </Link>
          <Link className="ClientsPage__backDash" href={`/${locale}/dashboard`}>
            ← Back to dashboard
          </Link>
        </div>
      </section>

      <section className="ExtrasFilters" aria-label="Extras filters">
        <form className="ExtrasFilters__form" method="get">
          <div className="ExtrasFilters__row">
            <label className="ExtrasFilters__field">
              <span className="ExtrasFilters__label">Year</span>
              <input className="ExtrasFilters__input" type="number" name="year" inputMode="numeric" placeholder="2026" defaultValue={year ?? ""} />
            </label>

            <label className="ExtrasFilters__field">
              <span className="ExtrasFilters__label">Month</span>
              <input className="ExtrasFilters__input" type="month" name="month" defaultValue={month ?? ""} />
            </label>

            <label className="ExtrasFilters__field">
              <span className="ExtrasFilters__label">Day</span>
              <input className="ExtrasFilters__input" type="date" name="day" defaultValue={day ?? ""} />
            </label>

            <label className="ExtrasFilters__field ExtrasFilters__field--grow">
              <span className="ExtrasFilters__label">Client / person name</span>
              <input
                className="ExtrasFilters__input"
                type="search"
                name="q"
                placeholder={clients.length ? `Search among ${clients.length} clients (or one-off names)` : "Search by name"}
                defaultValue={q ?? ""}
              />
            </label>
          </div>

          <div className="ExtrasFilters__actions">
            <button className="ExtrasFilters__apply" type="submit">
              Apply filters
            </button>
            <Link className="ExtrasFilters__reset" href={`/${locale}/extras`}>
              Reset (current month)
            </Link>
            <div className="ExtrasFilters__summary" aria-live="polite">
              Showing <strong>{extras.length}</strong> extras for <strong>{activeLabel}</strong> · total{" "}
              <strong>{formatEuroFromUnknown(total, locale)}</strong>
            </div>
          </div>
        </form>
      </section>

      {extras.length === 0 ? (
        <p className="ExtrasPage__empty">No extras for this period.</p>
      ) : (
        <div className="ExtraGrid" role="list">
          {extras.map((e) => (
            <div key={e.id} role="listitem">
              <ExtraCard extra={e} locale={locale} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

