import Link from "next/link";
import { isLocale, type Locale } from "@/i18n/config";
import { formatEuro } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function sumMonthlySalaries(rows: { monthly_salary: unknown }[] | null) {
  return (rows ?? []).reduce((sum, row) => {
    const v = row.monthly_salary;
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
      </section>
    </div>
  );
}

