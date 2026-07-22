-- Autenticação real (Supabase Auth) + tabelas de dados do usuário, cada uma
-- com RLS garantindo que uma conta só enxerga e altera as próprias linhas.
--
-- Script idempotente: pode ser executado mais de uma vez sem erro, mesmo que
-- uma execução anterior tenha parado no meio.

-- redefinida aqui (não só na 0001_offers.sql) pra essa migration poder rodar
-- sozinha, independente da ordem/estado de execução das outras.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- profiles: 1 linha por usuário autenticado
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  home_airport text,
  favorite_destinations text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- settings: 1 linha por usuário
-- ============================================================
create table if not exists public.settings (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  theme text not null default 'system' check (theme in ('light', 'system')),
  email_notifications boolean not null default true,
  push_notifications boolean not null default true,
  offer_alerts boolean not null default true,
  expiration_alerts boolean not null default true,
  transfer_promotions boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

drop policy if exists "settings_select_own" on public.settings;
create policy "settings_select_own" on public.settings for select using (auth.uid() = user_id);
drop policy if exists "settings_insert_own" on public.settings;
create policy "settings_insert_own" on public.settings for insert with check (auth.uid() = user_id);
drop policy if exists "settings_update_own" on public.settings;
create policy "settings_update_own" on public.settings for update using (auth.uid() = user_id);

drop trigger if exists settings_set_updated_at on public.settings;
create trigger settings_set_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

-- ============================================================
-- trigger: cria profile + settings assim que um usuário se cadastra
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email
  );
  insert into public.settings (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- programs: programas de fidelidade do usuário
-- ============================================================
create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  balance integer not null default 0,
  expiring_miles integer not null default 0,
  expiration_date date,
  account_number text,
  notes text,
  last_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.programs enable row level security;

drop policy if exists "programs_select_own" on public.programs;
create policy "programs_select_own" on public.programs for select using (auth.uid() = user_id);
drop policy if exists "programs_insert_own" on public.programs;
create policy "programs_insert_own" on public.programs for insert with check (auth.uid() = user_id);
drop policy if exists "programs_update_own" on public.programs;
create policy "programs_update_own" on public.programs for update using (auth.uid() = user_id);
drop policy if exists "programs_delete_own" on public.programs;
create policy "programs_delete_own" on public.programs for delete using (auth.uid() = user_id);

-- programs usa "last_updated_at" (não "updated_at"), por isso tem sua própria função de trigger.
create or replace function public.set_last_updated_at()
returns trigger as $$
begin
  new.last_updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists programs_set_last_updated_at on public.programs;
create trigger programs_set_last_updated_at
  before update on public.programs
  for each row execute function public.set_last_updated_at();

-- ============================================================
-- transactions: movimentações de milhas
-- ============================================================
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  program_id uuid references public.programs(id) on delete set null,
  type text not null check (type in ('transfer', 'redemption', 'bonus', 'expiration', 'adjustment')),
  amount integer not null,
  description text not null,
  date timestamptz not null default now(),
  balance_after integer,
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own" on public.transactions for select using (auth.uid() = user_id);
drop policy if exists "transactions_insert_own" on public.transactions;
create policy "transactions_insert_own" on public.transactions for insert with check (auth.uid() = user_id);
drop policy if exists "transactions_delete_own" on public.transactions;
create policy "transactions_delete_own" on public.transactions for delete using (auth.uid() = user_id);

-- ============================================================
-- alerts: alertas de ofertas
-- ============================================================
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  origin text not null,
  destination text not null,
  maximum_miles integer not null,
  cabin text not null check (cabin in ('economy', 'premium_economy', 'business')),
  passengers integer not null default 1,
  start_date date,
  end_date date,
  program_ids text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'paused', 'matched')),
  last_checked_at timestamptz,
  notification_frequency text not null default 'instant' check (notification_frequency in ('instant', 'daily', 'weekly')),
  created_at timestamptz not null default now()
);

alter table public.alerts enable row level security;

drop policy if exists "alerts_select_own" on public.alerts;
create policy "alerts_select_own" on public.alerts for select using (auth.uid() = user_id);
drop policy if exists "alerts_insert_own" on public.alerts;
create policy "alerts_insert_own" on public.alerts for insert with check (auth.uid() = user_id);
drop policy if exists "alerts_update_own" on public.alerts;
create policy "alerts_update_own" on public.alerts for update using (auth.uid() = user_id);
drop policy if exists "alerts_delete_own" on public.alerts;
create policy "alerts_delete_own" on public.alerts for delete using (auth.uid() = user_id);

-- ============================================================
-- notifications: notificações do usuário
-- ============================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  type text not null check (type in ('offer', 'expiration', 'transfer', 'balance')),
  read boolean not null default false,
  href text,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications for select using (auth.uid() = user_id);
drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications for update using (auth.uid() = user_id);

-- ============================================================
-- saved_offers: ofertas salvas pelo usuário
-- ============================================================
create table if not exists public.saved_offers (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  offer_id uuid not null references public.offers(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, offer_id)
);

alter table public.saved_offers enable row level security;

drop policy if exists "saved_offers_select_own" on public.saved_offers;
create policy "saved_offers_select_own" on public.saved_offers for select using (auth.uid() = user_id);
drop policy if exists "saved_offers_insert_own" on public.saved_offers;
create policy "saved_offers_insert_own" on public.saved_offers for insert with check (auth.uid() = user_id);
drop policy if exists "saved_offers_delete_own" on public.saved_offers;
create policy "saved_offers_delete_own" on public.saved_offers for delete using (auth.uid() = user_id);
