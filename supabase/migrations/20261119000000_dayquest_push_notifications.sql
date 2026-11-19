-- DayQuest per-device push subscriptions and once-per-day loan reminder delivery log.
create table if not exists public.dayquest_notification_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  subscription jsonb not null,
  preferences jsonb not null default '{"enabled": false, "loanGiven": true, "loanTaken": true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dayquest_notification_subscription_endpoint_https
    check (endpoint like 'https://%')
);

create index if not exists dayquest_notification_subscriptions_user_idx
  on public.dayquest_notification_subscriptions(user_id);

alter table public.dayquest_notification_subscriptions enable row level security;

drop policy if exists "Users manage their own DayQuest notification subscriptions"
  on public.dayquest_notification_subscriptions;
create policy "Users manage their own DayQuest notification subscriptions"
  on public.dayquest_notification_subscriptions
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete
  on public.dayquest_notification_subscriptions
  to authenticated;

-- A device gets at most one reminder for a particular loan on a particular
-- Dhaka calendar date. The endpoint is included so each registered device can
-- receive its own reminder.
create table if not exists public.dayquest_loan_reminder_deliveries (
  endpoint text not null references public.dayquest_notification_subscriptions(endpoint) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  loan_id text not null,
  reminder_date date not null,
  sent_at timestamptz not null default now(),
  primary key (endpoint, loan_id, reminder_date)
);

create index if not exists dayquest_loan_reminder_deliveries_date_idx
  on public.dayquest_loan_reminder_deliveries(reminder_date);

alter table public.dayquest_loan_reminder_deliveries enable row level security;

-- Delivery logs are read/written only by the Edge Function's service role.
revoke all on public.dayquest_loan_reminder_deliveries from anon, authenticated;
grant all on public.dayquest_loan_reminder_deliveries to service_role;
