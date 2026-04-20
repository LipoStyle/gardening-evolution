import Link from "next/link";
import { redirect } from "next/navigation";
import { createDailyLog, deleteDailyLog } from "@/app/[locale]/daily-logs/actions";
import { isLocale, localeToLangTag, type Locale } from "@/i18n/config";
import { parseIsoDate, todayIsoLocal } from "@/lib/isoDate";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DailyLogRow } from "@/types/dailyLog";

function formatLogTime(iso: string, locale: Locale) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(localeToLangTag[locale], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatLogDay(logDate: string, locale: Locale) {
  const p = parseIsoDate(logDate);
  if (!p) return logDate;
  const dt = new Date(p.y, p.m - 1, p.d, 12, 0, 0, 0);
  return dt.toLocaleDateString(localeToLangTag[locale], {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function DailyLogsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    day?: string;
    created?: string;
    updated?: string;
    deleted?: string;
    error?: string;
  }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const { day: dayParam, created, updated, deleted, error } = await searchParams;

  const dayRaw = String(dayParam ?? "").trim();
  const filterDay = parseIsoDate(dayRaw) ? dayRaw : null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  let query = supabase
    .from("daily_logs")
    .select("id, user_id, log_date, body, created_at, updated_at")
    .eq("user_id", user.id)
    .order("log_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filterDay) {
    query = query.eq("log_date", filterDay);
  }

  const { data, error: loadErr } = await query;
  const logs = (data ?? []) as DailyLogRow[];
  const loadError = loadErr?.message;

  const defaultNewDate = filterDay ?? todayIsoLocal();

  return (
    <div className="DailyLogsPage">
      <header className="DailyLogsPage__hero">
        <h1 className="DailyLogsPage__title">Daily logs</h1>
        <p className="DailyLogsPage__subtitle">Your work diary — plain text, private to your account.</p>
        <div className="DailyLogsPage__toolbar">
          <Link className="DailyLogsPage__back" href={`/${locale}/dashboard`}>
            ← Back to dashboard
          </Link>
        </div>
      </header>

      <section className="DailyLogsPage__filters" aria-label="Filter by day">
        <form className="DailyLogsPage__filterForm" method="get">
          <label className="DailyLogsPage__filterLabel">
            <span className="DailyLogsPage__filterText">Show day</span>
            <input className="DailyLogsPage__filterInput" type="date" name="day" defaultValue={filterDay ?? ""} />
          </label>
          <button className="DailyLogsPage__btn DailyLogsPage__btn--primary" type="submit">
            Apply
          </button>
          {filterDay ? (
            <Link className="DailyLogsPage__clearFilter" href={`/${locale}/daily-logs`}>
              Show all entries
            </Link>
          ) : null}
        </form>
      </section>

      {created ? (
        <p className="DailyLogsPage__flash DailyLogsPage__flash--ok" role="status">
          Note added.
        </p>
      ) : null}
      {updated ? (
        <p className="DailyLogsPage__flash DailyLogsPage__flash--ok" role="status">
          Note updated.
        </p>
      ) : null}
      {deleted ? (
        <p className="DailyLogsPage__flash DailyLogsPage__flash--ok" role="status">
          Note deleted.
        </p>
      ) : null}
      {error ? (
        <p className="DailyLogsPage__flash DailyLogsPage__flash--err" role="alert">
          {error}
        </p>
      ) : null}
      {loadError ? (
        <p className="DailyLogsPage__flash DailyLogsPage__flash--err" role="alert">
          {loadError}
        </p>
      ) : null}

      <section className="DailyLogsPage__feed" aria-label="All log entries">
        <h2 className="DailyLogsPage__feedTitle">{filterDay ? `Entries for ${filterDay}` : "All entries"}</h2>
        {logs.length === 0 ? (
          <p className="DailyLogsPage__empty">No notes yet{filterDay ? " for this day" : ""}.</p>
        ) : (
          <ul className="DailyLogsPage__list" role="list">
            {logs.map((row) => (
              <li key={row.id} className="DailyLogsPage__item" role="listitem">
                <div className="DailyLogsPage__itemHeader">
                  <span className="DailyLogsPage__itemDay">{formatLogDay(String(row.log_date), locale)}</span>
                  <span className="DailyLogsPage__itemTime">{formatLogTime(row.created_at, locale)}</span>
                </div>
                <p className="DailyLogsPage__itemBody">{row.body}</p>
                <div className="DailyLogsPage__itemActions">
                  <Link className="DailyLogsPage__linkBtn" href={`/${locale}/daily-logs/${row.id}/edit`}>
                    Edit
                  </Link>
                  <form className="DailyLogsPage__inlineForm" action={deleteDailyLog}>
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="log_date" value={String(row.log_date)} />
                    <input type="hidden" name="id" value={row.id} />
                    {filterDay ? <input type="hidden" name="list_day" value={filterDay} /> : null}
                    <button className="DailyLogsPage__btn DailyLogsPage__btn--danger" type="submit">
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="DailyLogsPage__create" aria-label="Add a note">
        <h2 className="DailyLogsPage__createTitle">Add a note</h2>
        <form className="DailyLogsPage__createForm" action={createDailyLog}>
          <input type="hidden" name="locale" value={locale} />
          {filterDay ? <input type="hidden" name="list_day" value={filterDay} /> : null}
          <label className="DailyLogsPage__field">
            <span className="DailyLogsPage__fieldLabel">Calendar day</span>
            <input className="DailyLogsPage__fieldInput" type="date" name="log_date" defaultValue={defaultNewDate} required />
          </label>
          <label className="DailyLogsPage__field">
            <span className="DailyLogsPage__fieldLabel">What happened?</span>
            <textarea
              className="DailyLogsPage__textarea"
              name="body"
              rows={5}
              placeholder="Payments, visits, work done, client names…"
              required
            />
          </label>
          <button className="DailyLogsPage__btn DailyLogsPage__btn--primary" type="submit">
            Save note
          </button>
        </form>
      </section>
    </div>
  );
}
