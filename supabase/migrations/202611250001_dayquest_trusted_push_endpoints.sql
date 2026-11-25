-- Restrict new DayQuest push subscriptions to known browser Web Push providers.
-- NOT VALID preserves existing rows while enforcing the constraint on new/updated rows.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'dayquest_notification_subscription_trusted_endpoint'
      and conrelid = 'public.dayquest_notification_subscriptions'::regclass
  ) then
    alter table public.dayquest_notification_subscriptions
      add constraint dayquest_notification_subscription_trusted_endpoint
      check (
        endpoint ~* '^https://(fcm\.googleapis\.com|web\.push\.apple\.com|updates\.push\.services\.mozilla\.com|push\.services\.mozilla\.com)/'
      ) not valid;
  end if;
end
$$;
