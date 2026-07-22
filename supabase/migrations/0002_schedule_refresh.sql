-- Agenda a atualização diária de ofertas via pg_cron + pg_net, chamando a
-- Edge Function "refresh-offers". A service_role key NUNCA fica neste arquivo:
-- ela é guardada no Vault do Supabase (rode o passo manual descrito abaixo
-- uma única vez, direto no SQL Editor do painel, com o valor real da sua chave).

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- === Passo manual (rodar UMA VEZ no SQL Editor do Supabase, com sua service_role key real) ===
-- select vault.create_secret('SUA_SERVICE_ROLE_KEY_AQUI', 'service_role_key');
-- ================================================================================================

select
  cron.schedule(
    'refresh-offers-daily',
    '0 6 * * *', -- todos os dias às 06:00 UTC (03:00 no horário de Brasília)
    $$
    select net.http_post(
      url := 'https://blscruvgclytjmfwjziv.supabase.co/functions/v1/refresh-offers',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (
          select decrypted_secret from vault.decrypted_secrets
          where name = 'service_role_key'
        )
      ),
      body := '{}'::jsonb
    );
    $$
  );

-- Para checar as execuções: select * from cron.job_run_details order by start_time desc limit 10;
-- Para cancelar: select cron.unschedule('refresh-offers-daily');
