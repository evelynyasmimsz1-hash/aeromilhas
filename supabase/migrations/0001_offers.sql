-- Tabela de ofertas, compartilhada entre todos os usuários do Aeromilhas.
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  origin text not null,
  origin_airport text not null,
  destination text not null,
  destination_airport text not null,
  miles integer not null check (miles > 0),
  taxes numeric(10, 2) not null default 0,
  currency text not null default 'BRL',
  program_name text not null,
  cabin text not null check (cabin in ('economy', 'premium_economy', 'business')),
  quality text not null check (quality in ('good', 'regular', 'high')),
  image_url text,
  departure_date date,
  return_date date,
  international boolean not null default true,
  highlight boolean not null default false,
  flash_deal_ends_at timestamptz,
  -- 'manual' = cadastrada pelo painel de admin, nunca é sobrescrita pela atualização automática.
  -- 'auto'   = gerada pela function diária, pode ser substituída a qualquer momento.
  source text not null default 'manual' check (source in ('manual', 'auto')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists offers_source_idx on public.offers (source);
create index if not exists offers_created_at_idx on public.offers (created_at desc);

alter table public.offers enable row level security;

-- Qualquer pessoa (usuário logado ou não) pode ler as ofertas.
create policy "Ofertas são públicas para leitura"
  on public.offers for select
  using (true);

-- Nenhuma política de insert/update/delete é criada de propósito:
-- escritas só acontecem via Edge Functions (admin-offers e refresh-offers),
-- que usam a service_role key e nunca ficam expostas ao client.

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger offers_set_updated_at
  before update on public.offers
  for each row
  execute function public.set_updated_at();
