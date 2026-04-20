import type { SupabaseClient } from "@supabase/supabase-js";
import { computeBalancedVisitPlan, firstIsoOfMonth, lastIsoOfMonth } from "@/lib/visitSchedule";
import type { ClientRow } from "@/types/client";
import type { CalendarDayVisitChip } from "@/types/clientVisit";

const ACCENT_PALETTE = [
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0891b2",
  "#2563eb",
  "#7c3aed",
  "#db2777",
] as const;

function fnv1a32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function accentForClientId(clientId: string): string {
  const i = fnv1a32(`client|${clientId}`) % ACCENT_PALETTE.length;
  return ACCENT_PALETTE[i]!;
}

function buildDisplayName(c: { name: string; surname: string }): string {
  return `${c.name} ${c.surname}`.trim() || c.name || c.surname;
}

type VisitSelectRow = {
  id: string;
  client_id: string;
  visit_date: string;
  clients: { name: string; surname: string } | { name: string; surname: string }[] | null;
};

function key(clientId: string, visitDate: string) {
  return `${clientId}|${visitDate}`;
}

/**
 * Recompute auto `client_visits` for a calendar month. Deletes `source=auto` in the range, then
 * inserts from `clients` rules, skipping dates already taken by a manual (or any) visit.
 */
export async function rebuildAutoVisitsForMonth(
  supabase: SupabaseClient,
  userId: string,
  year: number,
  monthIndex: number
) {
  const from = firstIsoOfMonth(year, monthIndex);
  const to = lastIsoOfMonth(year, monthIndex);

  await supabase
    .from("client_visits")
    .delete()
    .eq("user_id", userId)
    .eq("source", "auto")
    .gte("visit_date", from)
    .lte("visit_date", to);

  const { data: rows, error: remainErr } = await supabase
    .from("client_visits")
    .select("client_id, visit_date")
    .eq("user_id", userId)
    .gte("visit_date", from)
    .lte("visit_date", to);

  if (remainErr) return;

  const occupied = new Set(
    (rows ?? []).map((r) => key((r as { client_id: string; visit_date: string }).client_id, (r as { visit_date: string }).visit_date))
  );

  const { data: clients, error: clientsErr } = await supabase
    .from("clients")
    .select("id, visits_per_month, preferred_weekdays")
    .eq("user_id", userId);

  if (clientsErr || !clients?.length) return;

  const blacked = new Set<string>();
  const { data: boRows, error: boErr } = await supabase
    .from("client_visit_blackouts")
    .select("client_id, visit_date")
    .eq("user_id", userId)
    .gte("visit_date", from)
    .lte("visit_date", to);
  if (!boErr && boRows) {
    for (const r of boRows as { client_id: string; visit_date: string }[]) {
      blacked.add(key(r.client_id, r.visit_date));
    }
  }

  const plan = computeBalancedVisitPlan(
    year,
    monthIndex,
    (clients as ClientRow[]).map((row) => ({
      clientId: row.id,
      visitsN: row.visits_per_month != null ? row.visits_per_month : 1,
      preferredWeekdays: row.preferred_weekdays && row.preferred_weekdays.length > 0 ? [...row.preferred_weekdays] : null,
    }))
  );

  const inserts: { user_id: string; client_id: string; visit_date: string; source: "auto" }[] = [];
  for (const slot of plan) {
    const k = key(slot.clientId, slot.visit_date);
    if (occupied.has(k) || blacked.has(k)) continue;
    occupied.add(k);
    inserts.push({
      user_id: userId,
      client_id: slot.clientId,
      visit_date: slot.visit_date,
      source: "auto",
    });
  }

  if (inserts.length > 0) {
    await supabase.from("client_visits").insert(inserts);
  }
}

/**
 * All visit chips in the month, grouped by YYYY-MM-DD. Run after `rebuildAutoVisitsForMonth`.
 */
export async function loadCalendarMonthChips(
  supabase: SupabaseClient,
  userId: string,
  year: number,
  monthIndex: number
): Promise<Record<string, CalendarDayVisitChip[]>> {
  const from = firstIsoOfMonth(year, monthIndex);
  const to = lastIsoOfMonth(year, monthIndex);

  const { data, error } = await supabase
    .from("client_visits")
    .select("id, client_id, visit_date, clients (name, surname)")
    .eq("user_id", userId)
    .gte("visit_date", from)
    .lte("visit_date", to)
    .order("visit_date", { ascending: true });

  if (error || !data) return {};

  const byDate: Record<string, CalendarDayVisitChip[]> = {};
  for (const raw of data as unknown as VisitSelectRow[]) {
    const join = Array.isArray(raw.clients) ? raw.clients[0] : raw.clients;
    if (!join) continue;
    const chip: CalendarDayVisitChip = {
      id: raw.id,
      clientId: raw.client_id,
      name: buildDisplayName(join),
      accent: accentForClientId(raw.client_id),
    };
    const d = raw.visit_date;
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(chip);
  }

  for (const k of Object.keys(byDate)) {
    byDate[k]!.sort((a, b) => a.name.localeCompare(b.name));
  }

  return byDate;
}

export async function syncAndLoadMonth(
  supabase: SupabaseClient,
  userId: string,
  year: number,
  monthIndex: number
): Promise<Record<string, CalendarDayVisitChip[]>> {
  await rebuildAutoVisitsForMonth(supabase, userId, year, monthIndex);
  return loadCalendarMonthChips(supabase, userId, year, monthIndex);
}
