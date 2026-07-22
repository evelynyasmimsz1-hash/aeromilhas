-- O plano de R$ 197 não é assinatura anual — é vitalício (pagamento único).
-- Precisa de uma coluna pra guardar o PaymentIntent (não existe
-- "assinatura" no Stripe pra compras de pagamento único), e a constraint de
-- plano precisa aceitar 'lifetime' em vez de 'annual'.
--
-- Script idempotente: pode ser executado mais de uma vez sem erro.

alter table public.subscriptions
  add column if not exists stripe_payment_intent_id text;

update public.subscriptions set plan = 'lifetime' where plan = 'annual';

alter table public.subscriptions drop constraint if exists subscriptions_plan_check;
alter table public.subscriptions
  add constraint subscriptions_plan_check check (plan in ('monthly', 'lifetime'));
