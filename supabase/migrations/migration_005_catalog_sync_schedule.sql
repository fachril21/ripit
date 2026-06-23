-- RipIt — Migration 005: scheduled trigger for the sync-catalog Edge Function (ZUL-146).
-- Source: docs/architecture-and-security.md (sinkronisasi katalog).
--
-- Manual prerequisites before running this migration (project-specific, cannot be
-- expressed as portable DDL):
--   1. Deploy the function: `supabase functions deploy sync-catalog`.
--   2. Set its secret:      `supabase secrets set SYNC_CATALOG_SECRET=<random-value>`.
--   3. Store that same value in Vault so pg_net can read it:
--        select vault.create_secret('<random-value>', 'sync_catalog_secret');
--   4. Replace <PROJECT_REF> below with this project's ref.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'sync-catalog-daily',
  '0 3 * * *', -- 03:00 UTC daily
  $$
  select net.http_post(
    url := 'https://eyljccihvcxisvucmgfg.functions.supabase.co/sync-catalog',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets where name = 'sync_catalog_secret'
      )
    ),
    body := '{}'::jsonb
  );
  $$
);
