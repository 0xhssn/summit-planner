-- Summit Planner schema: expeditions and their day-by-day itinerary.

create table public.expeditions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  peak text,
  summit_altitude_m int check (summit_altitude_m between 0 and 9000),
  status text not null default 'planning'
    check (status in ('planning', 'summited', 'turned_back')),
  outcome_note text,
  created_at timestamptz not null default now()
);

create table public.days (
  id uuid primary key default gen_random_uuid(),
  expedition_id uuid not null references public.expeditions (id) on delete cascade,
  day_index int not null,
  camp_name text not null,
  sleep_altitude_m int not null check (sleep_altitude_m between 0 and 9000)
);

create index expeditions_user_id_idx on public.expeditions (user_id, created_at desc);
create index days_expedition_id_idx on public.days (expedition_id, day_index);

-- Row-level security: a user only ever sees their own expeditions and the days under them.
alter table public.expeditions enable row level security;
alter table public.days enable row level security;

create policy "Users manage their own expeditions"
  on public.expeditions for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage days of their own expeditions"
  on public.days for all
  to authenticated
  using (
    exists (
      select 1 from public.expeditions e
      where e.id = days.expedition_id and e.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.expeditions e
      where e.id = days.expedition_id and e.user_id = (select auth.uid())
    )
  );

-- Explicit grants in case the project doesn't expose new public tables to the Data API by default.
grant select, insert, update, delete on public.expeditions to authenticated;
grant select, insert, update, delete on public.days to authenticated;
