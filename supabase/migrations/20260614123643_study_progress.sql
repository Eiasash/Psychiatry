create table if not exists public.study_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create table if not exists public.study_stars (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create table if not exists public.study_sessions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists study_progress_user_updated_idx on public.study_progress (user_id, updated_at desc);
create index if not exists study_stars_user_updated_idx on public.study_stars (user_id, updated_at desc);

alter table public.study_progress enable row level security;
alter table public.study_stars enable row level security;
alter table public.study_sessions enable row level security;

grant select, insert, update, delete on public.study_progress to authenticated;
grant select, insert, update, delete on public.study_stars to authenticated;
grant select, insert, update, delete on public.study_sessions to authenticated;

create policy "study_progress_select_own"
  on public.study_progress for select to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "study_progress_insert_own"
  on public.study_progress for insert to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "study_progress_update_own"
  on public.study_progress for update to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "study_progress_delete_own"
  on public.study_progress for delete to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "study_stars_select_own"
  on public.study_stars for select to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "study_stars_insert_own"
  on public.study_stars for insert to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "study_stars_update_own"
  on public.study_stars for update to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "study_stars_delete_own"
  on public.study_stars for delete to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "study_sessions_select_own"
  on public.study_sessions for select to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "study_sessions_insert_own"
  on public.study_sessions for insert to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "study_sessions_update_own"
  on public.study_sessions for update to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "study_sessions_delete_own"
  on public.study_sessions for delete to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);
