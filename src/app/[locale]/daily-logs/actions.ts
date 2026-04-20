"use server";

import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { parseIsoDate } from "@/lib/isoDate";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MAX_BODY_LEN = 8000;

function redirectToDailyLogs(locale: Locale, qs: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(qs)) {
    if (v) params.set(k, v);
  }
  const q = params.toString();
  redirect(`/${locale}/daily-logs${q ? `?${q}` : ""}`);
}

export async function createDailyLog(formData: FormData) {
  const rawLocale = String(formData.get("locale") ?? "en");
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const log_date = String(formData.get("log_date") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const listDay = String(formData.get("list_day") ?? "").trim();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  if (!parseIsoDate(log_date) || !body || body.length > MAX_BODY_LEN) {
    if (parseIsoDate(log_date)) {
      redirectToDailyLogs(locale, {
        error: !body || body.length > MAX_BODY_LEN ? "Please enter a note (max 8000 characters)." : "Invalid note.",
        ...(parseIsoDate(listDay) ? { day: listDay } : {}),
      });
    }
    redirectToDailyLogs(locale, { error: "Invalid date." });
  }

  const { error } = await supabase.from("daily_logs").insert({
    user_id: user.id,
    log_date,
    body,
  });

  if (error) {
    redirectToDailyLogs(locale, {
      error: error.message,
      ...(parseIsoDate(listDay) ? { day: listDay } : {}),
    });
  }

  redirectToDailyLogs(locale, {
    created: "1",
    ...(parseIsoDate(listDay) ? { day: listDay } : {}),
  });
}

export async function updateDailyLog(formData: FormData) {
  const rawLocale = String(formData.get("locale") ?? "en");
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const log_date = String(formData.get("log_date") ?? "").trim();
  const id = String(formData.get("id") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  if (!parseIsoDate(log_date)) {
    redirectToDailyLogs(locale, { error: "Invalid date." });
  }

  if (!id) {
    redirectToDailyLogs(locale, { error: "Missing log entry." });
  }

  if (!body || body.length > MAX_BODY_LEN) {
    redirectToDailyLogs(locale, {
      error: "Please enter a valid note (max 8000 characters).",
    });
  }

  const { error } = await supabase
    .from("daily_logs")
    .update({ body, log_date, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/${locale}/daily-logs/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  redirectToDailyLogs(locale, { updated: "1" });
}

export async function deleteDailyLog(formData: FormData) {
  const rawLocale = String(formData.get("locale") ?? "en");
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const log_date = String(formData.get("log_date") ?? "").trim();
  const id = String(formData.get("id") ?? "").trim();
  const listDay = String(formData.get("list_day") ?? "").trim();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  if (!parseIsoDate(log_date)) {
    redirectToDailyLogs(locale, { error: "Invalid date." });
  }

  if (!id) {
    redirectToDailyLogs(locale, {
      error: "Missing log entry.",
      ...(parseIsoDate(listDay) ? { day: listDay } : {}),
    });
  }

  const { error } = await supabase.from("daily_logs").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    redirectToDailyLogs(locale, {
      error: error.message,
      ...(parseIsoDate(listDay) ? { day: listDay } : {}),
    });
  }

  redirectToDailyLogs(locale, {
    deleted: "1",
    ...(parseIsoDate(listDay) ? { day: listDay } : {}),
  });
}
