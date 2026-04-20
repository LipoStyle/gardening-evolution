"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function revalidateCalendar(locale: string, iso: string) {
  revalidatePath(`/${locale}/calendar`);
  revalidatePath(`/${locale}/calendar/${iso}`);
}

export async function deleteCalendarDayVisit(formData: FormData) {
  const rawLocale = String(formData.get("locale") ?? "en");
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const visitId = String(formData.get("visit_id") ?? "").trim();
  const iso = String(formData.get("visit_date") ?? "").trim();

  if (!visitId || !iso) {
    redirect(`/${locale}/calendar?error=${encodeURIComponent("Missing visit.")}`);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: row, error: fetchErr } = await supabase
    .from("client_visits")
    .select("id, client_id, visit_date")
    .eq("id", visitId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchErr || !row) {
    redirect(`/${locale}/calendar/${iso}?error=${encodeURIComponent("Visit not found.")}`);
  }

  const { error: delErr } = await supabase.from("client_visits").delete().eq("id", visitId).eq("user_id", user.id);
  if (delErr) {
    redirect(`/${locale}/calendar/${iso}?error=${encodeURIComponent(delErr.message)}`);
  }

  await supabase.from("client_visit_blackouts").upsert(
    {
      user_id: user.id,
      client_id: row.client_id as string,
      visit_date: row.visit_date as string,
    },
    { onConflict: "client_id,visit_date" }
  );

  revalidateCalendar(locale, iso);
  redirect(`/${locale}/calendar/${iso}?visit=deleted`);
}

export async function confirmCalendarDayVisit(formData: FormData) {
  const rawLocale = String(formData.get("locale") ?? "en");
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const visitId = String(formData.get("visit_id") ?? "").trim();
  const iso = String(formData.get("visit_date") ?? "").trim();

  if (!visitId || !iso) {
    redirect(`/${locale}/calendar?error=${encodeURIComponent("Missing visit.")}`);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("client_visits")
    .update({ confirmed_at: now, updated_at: now })
    .eq("id", visitId)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/${locale}/calendar/${iso}?error=${encodeURIComponent(error.message)}`);
  }

  revalidateCalendar(locale, iso);
  redirect(`/${locale}/calendar/${iso}?visit=confirmed`);
}

export async function createManualCalendarVisit(formData: FormData) {
  const rawLocale = String(formData.get("locale") ?? "en");
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const iso = String(formData.get("visit_date") ?? "").trim();
  const clientId = String(formData.get("client_id") ?? "").trim();

  if (!iso) {
    redirect(`/${locale}/calendar?error=${encodeURIComponent("Missing date.")}`);
  }
  if (!clientId) {
    redirect(`/${locale}/calendar/${iso}?error=${encodeURIComponent("Choose a client.")}`);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: own } = await supabase.from("clients").select("id").eq("id", clientId).eq("user_id", user.id).maybeSingle();
  if (!own) {
    redirect(`/${locale}/calendar/${iso}?error=${encodeURIComponent("Invalid client.")}`);
  }

  const { error } = await supabase.from("client_visits").insert({
    user_id: user.id,
    client_id: clientId,
    visit_date: iso,
    source: "manual",
  });

  if (error) {
    const msg =
      error.code === "23505"
        ? "This client already has a visit on that day."
        : error.message;
    redirect(`/${locale}/calendar/${iso}?error=${encodeURIComponent(msg)}`);
  }

  await supabase.from("client_visit_blackouts").delete().eq("client_id", clientId).eq("visit_date", iso);

  revalidateCalendar(locale, iso);
  redirect(`/${locale}/calendar/${iso}?visit=created`);
}
