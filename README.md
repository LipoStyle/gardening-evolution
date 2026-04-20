## Gardening Evolution

Multilingual Next.js app with Supabase authentication and simple income tracking workflows:

- **Clients**: create/manage clients with a monthly salary
- **Extras**: track one-off “extra income” jobs (either linked to a client or to a standalone person name)
- **Dashboard**: quick links + monthly totals
- **Calendar**: month grid with day pages (entry point for day-based workflows)

---

### Tech stack

- **Next.js (App Router)**: `next@16.x`
- **React**: `react@19`
- **TypeScript**
- **Supabase**:
  - `@supabase/ssr` for server-side auth/session refresh
  - `@supabase/supabase-js` for querying tables
- **CSS**: project styles live in `src/styles/`

---

### Project structure (high level)

- **Routing**: `src/app/`
  - Locale-prefixed routes under `src/app/[locale]/...` (ex: `/en/clients`)
  - Root `/` is redirected to `/{defaultLocale}` by middleware
- **Locale + redirect middleware**: `src/middleware.ts`
  - Ensures a locale segment exists (`/en`, `/el`, `/de`)
  - Refreshes Supabase session cookies when env is present
- **Supabase server client**: `src/lib/supabase/server.ts`
  - Uses `cookies()` and `@supabase/ssr` to create an authenticated server client
- **Domain types**: `src/types/`
  - `ClientRow`, `ExtraRow`, `ExtraRowWithClient`
- **UI components**: `src/components/`
  - Header shell, auth controls, dashboard widgets, cards, etc.

---

### Main routes

All primary routes are locale-prefixed.

- **Home**: `/{locale}`
- **Login**: `/{locale}/login`
- **Dashboard**: `/{locale}/dashboard`
- **Clients**
  - List: `/{locale}/clients`
  - Create: `/{locale}/clients/new`
  - Details: `/{locale}/clients/[id]`
  - Edit: `/{locale}/clients/[id]/edit`
- **Extras**
  - List + filters: `/{locale}/extras`
  - Create: `/{locale}/extras/new`
  - Details: `/{locale}/extras/[id]`
  - Edit: `/{locale}/extras/[id]/edit`
- **Calendar**
  - Month grid: `/{locale}/calendar`
  - Day page: `/{locale}/calendar/[date]` where `date` is `YYYY-MM-DD`

Supported locales are defined in `src/i18n/config.ts` (currently `en`, `el`, `de`).

---

### Data model (Supabase tables)

This app assumes at least these tables exist:

- **`public.clients`**
  - `id` (uuid)
  - `user_id` (uuid) — owner (Supabase Auth user)
  - `name`, `surname`, `mobile`, `city`
  - `monthly_salary` (numeric)
  - `created_at`
- **`public.extras`**
  - `id` (uuid)
  - `client_id` (uuid, nullable) — optional link to a `clients` row
  - `first_name`, `last_name` (nullable) — used when extra is not linked to a client
  - `salary` (numeric)
  - `work_date` (`YYYY-MM-DD`)
  - `notes` (text, nullable)
  - `created_at`, `updated_at`
  - (recommended) `display_name` (text, nullable) — denormalized searchable name

Notes:

- **Clients filtering** is scoped by `user_id` (see clients page).
- **Extras filtering** supports day/month/year date ranges and a free-text name query.
- For best performance on the name query, add the `display_name` column + index below.

---

### Environment variables

Copy `.env.example` to `.env.local` and fill in values:

- **`NEXT_PUBLIC_SUPABASE_URL`**: `https://<project-ref>.supabase.co`
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Publishable key (`sb_publishable_...`) or legacy anon JWT (`eyJ...`)

The env is validated in `src/lib/supabase/env.ts`.

---

### Getting started (local dev)

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

---

### Supabase setup

#### Extras: enable fast name search (recommended)

To support filtering extras by **client name or one-off person name** efficiently, add a `display_name` column and keep it in sync.

Run this in **Supabase SQL Editor**:

```sql
-- Add a display_name column for unified searching
alter table public.extras
add column if not exists display_name text;

-- Backfill existing rows
update public.extras e
set display_name =
  case
    when e.client_id is not null then coalesce(c.name, '') || ' ' || coalesce(c.surname, '')
    else coalesce(e.first_name, '') || ' ' || coalesce(e.last_name, '')
  end
from public.clients c
where (e.client_id = c.id or e.client_id is null);

-- Keep display_name updated
create or replace function public.extras_set_display_name()
returns trigger
language plpgsql
as $$
declare
  c record;
begin
  if new.client_id is not null then
    select name, surname into c from public.clients where id = new.client_id;
    new.display_name := trim(coalesce(c.name, '') || ' ' || coalesce(c.surname, ''));
    new.first_name := null;
    new.last_name := null;
  else
    new.display_name := trim(coalesce(new.first_name, '') || ' ' || coalesce(new.last_name, ''));
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_extras_set_display_name on public.extras;
create trigger trg_extras_set_display_name
before insert or update on public.extras
for each row
execute function public.extras_set_display_name();

-- Index for fast filtering (simple prefix/contains searches)
create index if not exists extras_display_name_idx on public.extras (display_name);
```

---

### Scripts

- **Dev**: `npm run dev`
- **Build**: `npm run build`
- **Start**: `npm run start`
- **Lint**: `npm run lint`

---

### What’s been implemented so far (from git history)

Current `main` includes (in order of commits):

- **Initial app foundation**
  - Next.js App Router project
  - Locale-prefixed routing (`/en`, `/el`, `/de`) + redirect middleware
  - Supabase SSR auth wiring
  - Clients CRUD pages (`/clients`, `/clients/new`, `/clients/[id]`, `/clients/[id]/edit`)
- **Documentation fix**: README improvements
- **Extras module**
  - Extras table integration + pages (`/extras`, `/extras/new`, `/extras/[id]`, `/extras/[id]/edit`)
  - Date range filtering (day/month/year) + name search (with `display_name` optimization)
- **Dashboard enhancements**
  - Monthly totals for extras
  - Client count + total monthly salary sum
- **Calendar UI**
  - Month grid layout with day cards
  - Full-width calendar layout + header tweaks

---

### Deployment

The app is compatible with typical Next.js hosting (ex: Vercel). Make sure you set the two Supabase public env vars in your hosting provider.

See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
