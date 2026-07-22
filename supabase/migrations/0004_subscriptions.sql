-- Assinaturas pagas (Stripe). Só o webhook (service_role) escreve nessa
-- tabela — não existe policy de insert/update pra usuário comum, porque o
-- status da assinatura tem que ser confirmado pelo Stripe, nunca pelo client.
--
-- Script idempotente: pode ser executado mais de uma vez sem erro.

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text check (plan in ('monthly', 'annual')),
  status text not null default 'incomplete' check (status in ('incomplete', 'active', 'past_due', 'canceled')),
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions for select using (auth.uid() = user_id);

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();
