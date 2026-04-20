"use server";

import { syncAndLoadMonth } from "@/lib/clientVisits/calendarData";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CalendarDayVisitChip } from "@/types/clientVisit";

export type FetchCalendarMonthResult = {
  byDate: Record<string, CalendarDayVisitChip[]>;
  signedIn: boolean;
};

export async function fetchCalendarMonth(year: number, monthIndex: number): Promise<FetchCalendarMonthResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { byDate: {}, signedIn: false };
  }
  try {
    const byDate = await syncAndLoadMonth(supabase, user.id, year, monthIndex);
    return { byDate, signedIn: true };
  } catch {
    return { byDate: {}, signedIn: true };
  }
}
