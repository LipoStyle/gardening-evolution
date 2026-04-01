## Gardening Evolution


### Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Routes include `/{en|el|de}/clients` and `/{en|el|de}/clients/new`.

### Supabase

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

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)

## Deploy on Vercel

See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
