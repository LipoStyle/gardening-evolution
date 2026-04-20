export type ClientRow = {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  surname: string;
  mobile: string;
  city: string;
  monthly_salary: number;
  /** 1–4. When `preferred_weekdays` is empty, visits are evenly spaced in the month. */
  visits_per_month?: number;
  /**
   * JS `getDay` values: 0=Sun … 6=Sat. If non-empty, every matching weekday in the month.
   * If null/empty, visits use even spacing in the month.
   */
  preferred_weekdays?: number[] | null;
};
