"use server";

import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { rebuildAutoVisitsForMonth } from "@/lib/clientVisits/calendarData";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function parseVisitScheduleFromForm(formData: FormData) {
  const raw = String(formData.get("visits_per_month") ?? "1");
  const n = Number.parseInt(raw, 10);
  const visits_per_month = Number.isFinite(n) ? Math.min(4, Math.max(1, n)) : 1;
  const chosen = formData
    .getAll("preferred_weekday")
    .map((v) => Number.parseInt(String(v), 10))
    .filter((x) => x >= 0 && x <= 6);
  const preferred_weekdays = [...new Set(chosen)].sort((a, b) => a - b);
  return {
    visits_per_month,
    preferred_weekdays: preferred_weekdays.length > 0 ? preferred_weekdays : null,
  } as const;
}

export async function createClient(formData: FormData) {
  const rawLocale = String(formData.get("locale") ?? "en");
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const name = String(formData.get("name") ?? "").trim();
  const surname = String(formData.get("surname") ?? "").trim();
  const mobile = String(formData.get("mobile") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const salaryRaw = String(formData.get("monthly_salary") ?? "").trim();
  const monthlySalary = Number.parseFloat(salaryRaw.replace(",", "."));

  if (!name || !surname || !mobile || !city || !Number.isFinite(monthlySalary)) {
    redirect(`/${locale}/clients/new?error=${encodeURIComponent("Please fill all fields with valid values.")}`);
  }

  const { visits_per_month, preferred_weekdays } = parseVisitScheduleFromForm(formData);

  const { error } = await supabase.from("clients").insert({
    user_id: user.id,
    name,
    surname,
    mobile,
    city,
    monthly_salary: monthlySalary,
    visits_per_month,
    preferred_weekdays,
  });

  if (error) {
    redirect(`/${locale}/clients/new?error=${encodeURIComponent(error.message)}`);
  }

  const now = new Date();
  try {
    await rebuildAutoVisitsForMonth(supabase, user.id, now.getFullYear(), now.getMonth());
  } catch {
    /* optional: `client_visits` / new columns not migrated yet */
  }

  redirect(`/${locale}/clients?created=1`);
}

export async function updateClient(formData: FormData) {
  const rawLocale = String(formData.get("locale") ?? "en");
  const locale = isLocale(rawLocale) ? rawLocale : "en";
  const id = String(formData.get("id") ?? "").trim();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  if (!id) {
    redirect(`/${locale}/clients?error=${encodeURIComponent("Missing client.")}`);
  }

  const name = String(formData.get("name") ?? "").trim();
  const surname = String(formData.get("surname") ?? "").trim();
  const mobile = String(formData.get("mobile") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const salaryRaw = String(formData.get("monthly_salary") ?? "").trim();
  const monthlySalary = Number.parseFloat(salaryRaw.replace(",", "."));

  if (!name || !surname || !mobile || !city || !Number.isFinite(monthlySalary)) {
    redirect(`/${locale}/clients/${id}/edit?error=${encodeURIComponent("Please fill all fields with valid values.")}`);
  }

  const { visits_per_month, preferred_weekdays } = parseVisitScheduleFromForm(formData);

  const { error } = await supabase
    .from("clients")
    .update({
      name,
      surname,
      mobile,
      city,
      monthly_salary: monthlySalary,
      visits_per_month,
      preferred_weekdays,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/${locale}/clients/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  const now = new Date();
  try {
    await rebuildAutoVisitsForMonth(supabase, user.id, now.getFullYear(), now.getMonth());
  } catch {
    /* optional migration */
  }

  redirect(`/${locale}/clients?updated=1`);
}

export async function deleteClient(formData: FormData) {
  const rawLocale = String(formData.get("locale") ?? "en");
  const locale = isLocale(rawLocale) ? rawLocale : "en";
  const id = String(formData.get("id") ?? "").trim();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  if (!id) {
    redirect(`/${locale}/clients?error=${encodeURIComponent("Missing client.")}`);
  }

  const { error } = await supabase.from("clients").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    redirect(`/${locale}/clients?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/${locale}/clients?deleted=1`);
}
