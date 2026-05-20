-- Run via Supabase CLI (`supabase db push`) or paste into SQL Editor in the dashboard.

create table if not exists public.waiting_list_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists waiting_list_data_updated_at_idx
  on public.waiting_list_data (updated_at desc);

alter table public.waiting_list_data enable row level security;

create policy "waiting_list_data_select_own"
  on public.waiting_list_data for select
  using (auth.uid() = user_id);

create policy "waiting_list_data_insert_own"
  on public.waiting_list_data for insert
  with check (auth.uid() = user_id);

create policy "waiting_list_data_update_own"
  on public.waiting_list_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
