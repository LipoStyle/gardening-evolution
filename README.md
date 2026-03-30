## Gardening Evolution

### Supabase: `clients` table

Run in the Supabase SQL editor before using **Create client**:

```sql
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  surname text not null,
  mobile text not null,
  city text not null,
  monthly_salary numeric(12, 2) not null
);

alter table public.clients enable row level security;

create policy "Users manage own clients"
on public.clients
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Required: PostgreSQL "permission denied" on insert usually means missing GRANTs (RLS is separate).
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.clients to authenticated;
```

If the table already exists, run only the grants (and policies):

```sql
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.clients to authenticated;
```

### Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Routes include `/{en|el|de}/clients` and `/{en|el|de}/clients/new`.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)

## Deploy on Vercel

See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
