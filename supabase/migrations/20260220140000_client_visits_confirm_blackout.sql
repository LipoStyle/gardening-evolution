-- Visit completion + suppress auto-reinsert after user deletes a visit

alter table public.client_visits
  add column if not exists confirmed_at timestamptz null;

create table if not exists public.client_visit_blackouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  visit_date date not null,
  created_at timestamptz not null default now(),
  unique (client_id, visit_date)
);

create index if not exists client_visit_blackouts_user_date_idx
  on public.client_visit_blackouts (user_id, visit_date);

alter table public.client_visit_blackouts enable row level security;

create policy "client_visit_blackouts_select_own"
on public.client_visit_blackouts for select
using (auth.uid() = user_id);

create policy "client_visit_blackouts_insert_own"
on public.client_visit_blackouts for insert
with check (auth.uid() = user_id);

create policy "client_visit_blackouts_delete_own"
on public.client_visit_blackouts for delete
using (auth.uid() = user_id);

grant select, insert, delete on table public.client_visit_blackouts to authenticated;
