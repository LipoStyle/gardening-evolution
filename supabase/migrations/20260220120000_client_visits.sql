-- Visit scheduling: rules on clients, concrete dates in client_visits
-- Run via Supabase CLI or copy into SQL Editor (see README).

alter table public.clients
  add column if not exists visits_per_month smallint not null default 1
    check (visits_per_month >= 1 and visits_per_month <= 4);

-- JS weekday: 0 = Sunday … 6 = Saturday. NULL = no fixed weekday, use even spacing in the month.
alter table public.clients
  add column if not exists preferred_weekdays smallint[] null;

create table if not exists public.client_visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  visit_date date not null,
  source text not null default 'auto' check (source in ('auto', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, visit_date)
);

create index if not exists client_visits_user_date_idx on public.client_visits (user_id, visit_date);
create index if not exists client_visits_client_id_idx on public.client_visits (client_id);

alter table public.client_visits enable row level security;

create policy "client_visits_select_own"
on public.client_visits for select
using (auth.uid() = user_id);

create policy "client_visits_insert_own"
on public.client_visits for insert
with check (auth.uid() = user_id);

create policy "client_visits_update_own"
on public.client_visits for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "client_visits_delete_own"
on public.client_visits for delete
using (auth.uid() = user_id);

grant select, insert, update, delete on table public.client_visits to authenticated;
