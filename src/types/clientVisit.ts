export type ClientVisitSource = "auto" | "manual";

export type ClientVisitRow = {
  id: string;
  user_id: string;
  client_id: string;
  visit_date: string;
  source: ClientVisitSource;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Visit row joined with client name for calendar day UI. */
export type CalendarDayVisitListItem = {
  id: string;
  client_id: string;
  visit_date: string;
  source: ClientVisitSource;
  confirmed_at: string | null;
  displayName: string;
  accent: string;
};

/** Chips for calendar day cards (client + stable color). */
export type CalendarDayVisitChip = {
  id: string;
  clientId: string;
  name: string;
  accent: string;
};
