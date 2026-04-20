import Link from "next/link";
import { isLocale, type Locale } from "@/i18n/config";
import { formatEuro } from "@/lib/format";
import { currentMonthRange } from "@/lib/monthRange";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function sumMonthlySalaries(rows: { monthly_salary: unknown }[] | null) {
  return (rows ?? []).reduce((sum, row) => {
    const v = row.monthly_salary;
    const n = typeof v === "number" ? v : Number.parseFloat(String(v));
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
}

function sumExtraSalaries(rows: { salary: unknown }[] | null) {
  return (rows ?? []).reduce((sum, row) => {
    const v = row.salary;
    const n = typeof v === "number" ? v : Number.parseFloat(String(v));
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
}

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let clientTotal: number | null = null;
  let salaryMonthlyTotal: number | null = null;
  let extrasMonthTotal: number | null = null;
  if (user) {
    const { data, error } = await supabase
      .from("clients")
      .select("monthly_salary")
      .eq("user_id", user.id);
    if (error) {
      clientTotal = 0;
      salaryMonthlyTotal = 0;
    } else {
      const rows = data ?? [];
      clientTotal = rows.length;
      salaryMonthlyTotal = sumMonthlySalaries(rows);
    }

    const { start, end } = currentMonthRange();
    const { data: extrasRows, error: extrasErr } = await supabase
      .from("extras")
      .select("salary")
      .gte("work_date", start)
      .lte("work_date", end);
    extrasMonthTotal = extrasErr ? 0 : sumExtraSalaries(extrasRows);
  }

  return (
    <div className="Dashboard">
      <section className="DashboardTiles" aria-label="Dashboard">
        <Link className="DashboardTile" href={`/${locale}/calendar`}>
          <div className="DashboardTile__title">Calendar</div>
          <div className="DashboardTile__subtitle">View and manage days</div>
        </Link>
        <Link className="DashboardTile" href={`/${locale}/clients`}>
          <div className="DashboardTile__title">Client</div>
          <div className="DashboardTile__subtitle">Create and manage clients</div>
          {clientTotal !== null && salaryMonthlyTotal !== null ? (
            <div className="DashboardTile__metrics" aria-live="polite">
              <div className="DashboardTile__metric">
                <span className="DashboardTile__statNumber">{clientTotal}</span>
                <span className="DashboardTile__statCaption">
                  {clientTotal === 1 ? "client in total" : "clients in total"}
                </span>
              </div>
              <div className="DashboardTile__metric">
                <span className="DashboardTile__statNumber DashboardTile__statNumber--currency">
                  {formatEuro(salaryMonthlyTotal, locale)}
                </span>
                <span className="DashboardTile__statCaption">total monthly salary (EUR)</span>
              </div>
            </div>
          ) : (
            <div className="DashboardTile__stat DashboardTile__stat--muted">
              Sign in to see your client total and salary sum
            </div>
          )}
        </Link>
        <Link className="DashboardTile" href={`/${locale}/extras`}>
          <div className="DashboardTile__title">Extras</div>
          <div className="DashboardTile__subtitle">Track extra income jobs</div>
          {extrasMonthTotal !== null ? (
            <div className="DashboardTile__metrics" aria-live="polite">
              <div className="DashboardTile__metric">
                <span className="DashboardTile__statNumber DashboardTile__statNumber--currency">
                  {formatEuro(extrasMonthTotal, locale)}
                </span>
                <span className="DashboardTile__statCaption">extra income this month (EUR)</span>
              </div>
            </div>
          ) : (
            <div className="DashboardTile__stat DashboardTile__stat--muted">
              Sign in to see this month&apos;s extra income total
            </div>
          )}
        </Link>
        <Link className="DashboardTile" href={`/${locale}/daily-logs`}>
          <div className="DashboardTile__title">Daily logs</div>
          <div className="DashboardTile__subtitle">Work diary — view and edit your notes</div>
          <div className="DashboardTile__stat DashboardTile__stat--muted">
            {user ? "Open feed" : "Sign in to manage daily logs"}
          </div>
        </Link>
      </section>
    </div>
  );
}
