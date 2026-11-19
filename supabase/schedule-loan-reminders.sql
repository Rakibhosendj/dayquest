-- Run this once in the Supabase SQL Editor AFTER enabling pg_cron, pg_net and Vault,
-- deploying send-loan-reminders, and storing the three Vault secrets below.
--
-- Store these values with your own credentials (do not commit them to GitHub):
--   dayquest_project_url      = https://YOUR-PROJECT-REF.supabase.co
--   dayquest_publishable_key  = your sb_publishable_... key
--   dayquest_cron_secret      = the same random secret configured as DAYQUEST_CRON_SECRET
--
-- Example Vault calls (replace each placeholder before running):
-- select vault.create_secret('https://YOUR-PROJECT-REF.supabase.co', 'dayquest_project_url');
-- select vault.create_secret('YOUR_SB_PUBLISHABLE_KEY', 'dayquest_publishable_key');
-- select vault.create_secret('YOUR_LONG_RANDOM_CRON_SECRET', 'dayquest_cron_secret');

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

select cron.unschedule(jobid)
from cron.job
where jobname = 'dayquest-loan-reminders';

-- 18:05 UTC is 00:05 in Asia/Dhaka (UTC+6). The function checks the family
-- loan due date in Asia/Dhaka and sends one reminder per device/loan each day
-- until the loan is fully collected or repaid.
select cron.schedule(
  'dayquest-loan-reminders',
  '5 18 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'dayquest_project_url')
      || '/functions/v1/send-loan-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'dayquest_publishable_key'),
      'x-dayquest-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'dayquest_cron_secret')
    ),
    body := jsonb_build_object('source', 'dayquest-loan-reminder-cron'),
    timeout_milliseconds := 10000
  ) as request_id;
  $$
);
