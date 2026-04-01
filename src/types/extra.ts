export type ExtraRow = {
  id: string;
  client_id: string | null;
  first_name: string | null;
  last_name: string | null;
  display_name?: string | null;
  salary: number;
  work_date: string; // YYYY-MM-DD
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ExtraRowWithClient = ExtraRow & {
  // Supabase relationship typing may come back as an array for joins
  clients?: { name: string; surname: string } | { name: string; surname: string }[] | null;
};

