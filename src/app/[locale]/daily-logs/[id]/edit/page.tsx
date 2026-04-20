import Link from "next/link";
import { notFound } from "next/navigation";
import { updateDailyLog } from "@/app/[locale]/daily-logs/actions";
import { isLocale, type Locale } from "@/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DailyLogRow } from "@/types/dailyLog";

export default async function EditDailyLogPage({
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

  const { data: row, error: fetchErr } = await supabase
    .from("daily_logs")
    .select("id, user_id, log_date, body, created_at, updated_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchErr || !row) {
    notFound();
  }

  const log = row as DailyLogRow;
  const logDateStr = String(log.log_date).slice(0, 10);

  return (
    <section className="AuthCard DailyLogsEdit">
      <h1 className="AuthCard__title">Edit daily log</h1>
      <p className="AuthCard__hint">Update the calendar day or the note text.</p>

      {error ? (
        <div className="AuthCard__error" role="alert">
          {error}
        </div>
      ) : null}

      <form className="AuthForm" action={updateDailyLog}>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="id" value={log.id} />

        <label className="AuthField">
          <span className="AuthField__label">Calendar day</span>
          <input className="AuthField__input" type="date" name="log_date" defaultValue={logDateStr} required />
        </label>

        <label className="AuthField">
          <span className="AuthField__label">Note</span>
          <textarea className="AuthField__input" name="body" rows={8} defaultValue={log.body} required />
        </label>

        <button className="AuthForm__submit" type="submit">
          Save changes
        </button>
      </form>

      <p className="AuthCard__footer">
        <Link className="AuthCard__link" href={`/${locale}/daily-logs`}>
          ← Back to daily logs
        </Link>
      </p>
    </section>
  );
}
