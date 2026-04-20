import { toIsoDateString } from "@/lib/isoDate";

export const MAX_VISITS_PER_DAY = 3;

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function getDayWeek(year: number, monthIndex: number, dayOfMonth: number) {
  return new Date(year, monthIndex, dayOfMonth, 12, 0, 0, 0).getDay();
}

function fnv1a32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function minGapBetweenClientVisits(dim: number, visitsN: number): number {
  if (visitsN <= 1) return 0;
  return Math.max(3, Math.floor(dim / (visitsN + 1)));
}

function toIso(year: number, monthIndex: number, day: number) {
  return toIsoDateString({ y: year, m: monthIndex + 1, d: day });
}

export type ClientScheduleInput = {
  clientId: string;
  visitsN: number;
  preferredWeekdays: number[] | null;
};

function pickDay(
  cand: number[],
  getLoad: (d: number) => number,
  clientId: string,
  visitIndex: number
): number | null {
  if (cand.length === 0) return null;
  const m = Math.min(...cand.map((d) => getLoad(d)));
  const best = cand.filter((d) => getLoad(d) === m);
  if (best.length === 1) return best[0] ?? null;
  best.sort((a, b) => {
    const ta = (fnv1a32(`${clientId}|v${visitIndex}|d${a}`) & 0xffff) / 0x10000;
    const tb = (fnv1a32(`${clientId}|v${visitIndex}|d${b}`) & 0xffff) / 0x10000;
    if (ta !== tb) return ta - tb;
    return a - b;
  });
  return best[0] ?? null;
}

function weekdayOk(
  year: number,
  monthIndex: number,
  d: number,
  hasPref: boolean,
  pref: number[] | null
): boolean {
  if (!hasPref || !pref || pref.length === 0) return true;
  return new Set(pref).has(getDayWeek(year, monthIndex, d));
}

/**
 * @returns reordered days or null if move invalid
 */
function withMovedDay(
  days: number[],
  fromD: number,
  toD: number,
  dim: number,
  visitsN: number
): number[] | null {
  if (!days.includes(fromD) || days.includes(toD) || toD < 1 || toD > dim) return null;
  const n = days.filter((x) => x !== fromD);
  n.push(toD);
  n.sort((a, b) => a - b);
  const g = minGapBetweenClientVisits(dim, Math.max(visitsN, 1));
  const need = g <= 2 ? 1 : Math.max(2, Math.floor(g * 0.6));
  for (let i = 1; i < n.length; i++) {
    if (n[i]! - n[i - 1]! < need) return null;
  }
  return n;
}

/**
 * Cap 3 per day; space client visits; preferred clients first, then flexible with pseudo-random ties.
 */
export function computeBalancedVisitPlan(
  year: number,
  monthIndex: number,
  clients: ClientScheduleInput[]
): { clientId: string; visit_date: string }[] {
  const dim = daysInMonth(year, monthIndex);
  const cap = MAX_VISITS_PER_DAY;

  const load = new Array(dim + 1).fill(0) as number[];
  const L = (d: number) => load[d]!;

  const byClient = new Map<string, number[]>();
  for (const c of clients) {
    byClient.set(c.clientId, []);
  }

  const order = [...clients].sort((a, b) => {
    const ap = Boolean(a.preferredWeekdays && a.preferredWeekdays.length);
    const bp = Boolean(b.preferredWeekdays && b.preferredWeekdays.length);
    if (ap !== bp) return ap ? -1 : 1;
    return a.clientId.localeCompare(b.clientId);
  });

  function collect(
    c: ClientScheduleInput,
    placed: number[],
    minStart: number,
    maxLoadExclusive: number,
    yearY: number,
    monthI: number,
    onlyPref: boolean
  ): number[] {
    const hasP = Boolean(c.preferredWeekdays && c.preferredWeekdays.length);
    const pref = c.preferredWeekdays;
    const out: number[] = [];
    for (let d = 1; d <= dim; d++) {
      if (d < minStart) continue;
      if (L(d) >= maxLoadExclusive) continue;
      if (placed.includes(d)) continue;
      if (onlyPref) {
        if (!weekdayOk(yearY, monthI, d, hasP, hasP ? pref : null)) continue;
      } else if (hasP) {
        if (!weekdayOk(yearY, monthI, d, true, pref!)) continue;
      }
      out.push(d);
    }
    return out;
  }

  for (const c of order) {
    const n = Math.max(1, Math.min(4, Math.round(c.visitsN) || 1));
    const g = minGapBetweenClientVisits(dim, n);
    const hasP = Boolean(c.preferredWeekdays && c.preferredWeekdays.length);
    const placed = byClient.get(c.clientId)!;

    for (let k = 0; k < n; k++) {
      const minS = k === 0 ? 1 : (placed[placed.length - 1] ?? 1) + g;

      let cands: number[] = collect(c, placed, minS, cap + 0, year, monthIndex, true);
      if (cands.length === 0) {
        cands = collect(c, placed, 1, cap + 0, year, monthIndex, true);
      }
      if (cands.length === 0) {
        cands = collect(c, placed, 1, cap + 0, year, monthIndex, false);
      }
      if (cands.length === 0) {
        cands = collect(c, placed, 1, cap + 1, year, monthIndex, true);
      }
      if (cands.length === 0) {
        for (let d = 1; d <= dim; d++) {
          if (placed.includes(d)) continue;
          if (L(d) < cap + 1) cands.push(d);
        }
      }
      if (cands.length === 0) {
        for (let d = 1; d <= dim; d++) {
          if (placed.includes(d)) continue;
          cands.push(d);
        }
      }

      const chosen = pickDay(cands, L, c.clientId, k);
      if (chosen == null) continue;
      placed.push(chosen);
      load[chosen]++;
    }
  }

  function canRebalance(c: ClientScheduleInput, toD: number) {
    const hasP = Boolean(c.preferredWeekdays?.length);
    return !hasP || weekdayOk(year, monthIndex, toD, true, c.preferredWeekdays!);
  }

  for (let _ = 0; _ < 60; _++) {
    const emptyD = (() => {
      for (let d = 1; d <= dim; d++) {
        if (L(d) === 0) return d;
      }
      return null;
    })();
    if (emptyD == null) break;

    let m: { id: string; from: number; next: number[] } | null = null;
    for (let fromD = dim; fromD >= 1; fromD--) {
      if (L(fromD) < 1) continue;
      for (const c of clients) {
        if (!canRebalance(c, emptyD)) continue;
        const dArr = byClient.get(c.clientId)!;
        const nV = Math.max(1, Math.min(4, c.visitsN | 0));
        const nxt = withMovedDay(dArr, fromD, emptyD, dim, nV);
        if (nxt) {
          m = { id: c.clientId, from: fromD, next: nxt };
          break;
        }
      }
      if (m) break;
    }
    if (!m) {
      for (let fromD = dim; fromD >= 1; fromD--) {
        if (L(fromD) < 1) continue;
        for (const c of clients) {
          if (!canRebalance(c, emptyD)) continue;
          const dArr = byClient.get(c.clientId)!;
          const nV = Math.max(1, Math.min(4, c.visitsN | 0));
          const nxt = withMovedDay(dArr, fromD, emptyD, dim, Math.max(1, nV - 1));
          if (nxt) {
            m = { id: c.clientId, from: fromD, next: nxt };
            break;
          }
        }
        if (m) break;
      }
    }
    if (!m) break;
    byClient.set(m.id, m.next);
    load[m.from]--;
    load[emptyD]++;
  }

  const out: { clientId: string; visit_date: string }[] = [];
  for (const c of clients) {
    for (const d of (byClient.get(c.clientId) ?? []).sort((a, b) => a - b)) {
      out.push({ clientId: c.clientId, visit_date: toIso(year, monthIndex, d) });
    }
  }
  return out;
}

export function firstIsoOfMonth(year: number, monthIndex: number): string {
  return toIsoDateString({ y: year, m: monthIndex + 1, d: 1 });
}

export function lastIsoOfMonth(year: number, monthIndex: number): string {
  return toIsoDateString({ y: year, m: monthIndex + 1, d: daysInMonth(year, monthIndex) });
}

export function getWeekdayForIsoDate(iso: string): number | null {
  const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!p) return null;
  const y = Number(p[1]);
  const m = Number(p[2]) - 1;
  const d = Number(p[3]);
  const t = new Date(y, m, d, 12, 0, 0, 0);
  if (t.getFullYear() !== y || t.getMonth() !== m || t.getDate() !== d) return null;
  return t.getDay();
}
