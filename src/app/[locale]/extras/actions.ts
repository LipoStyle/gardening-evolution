"use server";

import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function parseMoney(raw: string) {
  const n = Number.parseFloat(raw.trim().replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

export async function createExtra(formData: FormData) {
  const rawLocale = String(formData.get("locale") ?? "en");
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const clientIdRaw = String(formData.get("client_id") ?? "").trim();
  const client_id = clientIdRaw ? clientIdRaw : null;

  const first_name = String(formData.get("first_name") ?? "").trim();
  const last_name = String(formData.get("last_name") ?? "").trim();
  const salaryRaw = String(formData.get("salary") ?? "").trim();
  const salary = parseMoney(salaryRaw);
  const work_date = String(formData.get("work_date") ?? "").trim();
  const notesRaw = String(formData.get("notes") ?? "").trim();
  const notes = notesRaw ? notesRaw : null;

  const hasClient = Boolean(client_id);
  const hasPerson = Boolean(first_name && last_name);

  if (!work_date || !Number.isFinite(salary) || salary < 0 || (!hasClient && !hasPerson) || (hasClient && hasPerson)) {
    redirect(
      `/${locale}/extras/new?error=${encodeURIComponent(
        "Please provide a valid date, salary, and either select a client OR enter a first & last name."
      )}`
    );
  }

  const payload: Record<string, unknown> = {
    client_id,
    salary,
    work_date,
    notes,
  };

  if (!client_id) {
    payload.first_name = first_name;
    payload.last_name = last_name;
  }

  const { error } = await supabase.from("extras").insert(payload);
  if (error) {
    redirect(`/${locale}/extras/new?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/${locale}/extras?created=1`);
}

export async function updateExtra(formData: FormData) {
  const rawLocale = String(formData.get("locale") ?? "en");
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const id = String(formData.get("id") ?? "").trim();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  if (!id) {
    redirect(`/${locale}/extras?error=${encodeURIComponent("Missing extra.")}`);
  }

  const clientIdRaw = String(formData.get("client_id") ?? "").trim();
  const client_id = clientIdRaw ? clientIdRaw : null;

  const first_name = String(formData.get("first_name") ?? "").trim();
  const last_name = String(formData.get("last_name") ?? "").trim();
  const salaryRaw = String(formData.get("salary") ?? "").trim();
  const salary = parseMoney(salaryRaw);
  const work_date = String(formData.get("work_date") ?? "").trim();
  const notesRaw = String(formData.get("notes") ?? "").trim();
  const notes = notesRaw ? notesRaw : null;

  const hasClient = Boolean(client_id);
  const hasPerson = Boolean(first_name && last_name);

  if (!work_date || !Number.isFinite(salary) || salary < 0 || (!hasClient && !hasPerson) || (hasClient && hasPerson)) {
    redirect(
      `/${locale}/extras/${id}/edit?error=${encodeURIComponent(
        "Please provide a valid date, salary, and either select a client OR enter a first & last name."
      )}`
    );
  }

  const payload: Record<string, unknown> = {
    client_id,
    salary,
    work_date,
    notes,
    updated_at: new Date().toISOString(),
  };

  if (client_id) {
    payload.first_name = null;
    payload.last_name = null;
  } else {
    payload.first_name = first_name;
    payload.last_name = last_name;
  }

  const { error } = await supabase.from("extras").update(payload).eq("id", id);
  if (error) {
    redirect(`/${locale}/extras/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/${locale}/extras?updated=1`);
}

export async function deleteExtra(formData: FormData) {
  const rawLocale = String(formData.get("locale") ?? "en");
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const id = String(formData.get("id") ?? "").trim();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  if (!id) {
    redirect(`/${locale}/extras?error=${encodeURIComponent("Missing extra.")}`);
  }

  const { error } = await supabase.from("extras").delete().eq("id", id);
  if (error) {
    redirect(`/${locale}/extras?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/${locale}/extras?deleted=1`);
}

