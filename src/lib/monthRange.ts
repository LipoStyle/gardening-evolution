function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function monthRangeFrom(ym: string) {
  const m = /^(\d{4})-(\d{2})$/.exec(ym);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) return null;
  const start = `${year}-${pad2(month)}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const endDate = new Date(Date.UTC(nextYear, nextMonth - 1, 1));
  endDate.setUTCDate(endDate.getUTCDate() - 1);
  const end = `${endDate.getUTCFullYear()}-${pad2(endDate.getUTCMonth() + 1)}-${pad2(endDate.getUTCDate())}`;
  return { start, end };
}

export function yearRangeFrom(yearRaw: string) {
  const y = Number.parseInt(yearRaw, 10);
  if (!Number.isFinite(y) || y < 1970 || y > 2100) return null;
  return { start: `${y}-01-01`, end: `${y}-12-31` };
}

/** Calendar month in the user's local timezone (matches extras list default). */
export function currentMonthRange() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  return monthRangeFrom(`${y}-${pad2(m)}`)!;
}
