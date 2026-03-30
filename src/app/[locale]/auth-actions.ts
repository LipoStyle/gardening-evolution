"use server";

import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signOut(formData: FormData) {
  const rawLocale = String(formData.get("locale") ?? "en");
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  redirect(`/${locale}`);
}

