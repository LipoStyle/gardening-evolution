/** Parse `YYYY-MM-DD` and validate as a real calendar day (local semantics). */
export function parseIsoDate(raw: string): { y: number; m: number; d: number } | null {
  const trimmed = raw.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return null;
  const y = Number(match[1]);
  const mo = Number(match[2]);
  const d = Number(match[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
  const dt = new Date(y, mo - 1, d, 12, 0, 0, 0);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return { y, m: mo, d };
}

export function toIsoDateString(parts: { y: number; m: number; d: number }): string {
  const mm = String(parts.m).padStart(2, "0");
  const dd = String(parts.d).padStart(2, "0");
  return `${parts.y}-${mm}-${dd}`;
}

/** Calendar day for “today” in the runtime’s local timezone (dev server / Node). */
export function todayIsoLocal(): string {
  const d = new Date();
  return toIsoDateString({ y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() });
}
