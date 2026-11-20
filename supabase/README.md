# DayQuest Supabase push notifications

DayQuest's notification interface stores the selected preferences per registered device. Background loan reminders are sent by a Supabase Edge Function, so they can arrive while the PWA is closed.

## What is included

- `save-notification-subscription`: validates the signed-in DayQuest user and stores/removes the browser push subscription.
- `send-loan-reminders`: checks Daily Quest alarms at each device's selected time-range start, expense and income dues at/after 08:00 local time, and each outstanding loan installment at/after 08:00 local time. It respects each device's selected notification categories and sends at most one notification per event per local calendar day.
- `20261119000000_dayquest_push_notifications.sql`: creates per-device subscription storage and duplicate-delivery protection.
- `schedule-loan-reminders.sql`: schedules a one-minute check for each registered device's own time zone.

## Deploy

Use the Supabase CLI from the repository root:

```sh
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
supabase functions deploy save-notification-subscription
supabase functions deploy send-loan-reminders
```

The scheduled function has JWT verification disabled in `config.toml`. The scheduler sends the Supabase secret API key in the `apikey` header plus a separate long random `DAYQUEST_CRON_SECRET` header. Keep both values in Supabase Vault / Function Secrets; do not put either value in browser code or commit it.

## Create VAPID keys

Generate one VAPID key pair (keep the private key secret):

```sh
npx web-push generate-vapid-keys
```

Set these Supabase Edge Function secrets:

```sh
supabase secrets set \
  VAPID_PUBLIC_KEY="YOUR_VAPID_PUBLIC_KEY" \
  VAPID_PRIVATE_KEY="YOUR_VAPID_PRIVATE_KEY" \
  VAPID_SUBJECT="mailto:YOUR_ADMIN_EMAIL" \
  DAYQUEST_CRON_SECRET="A_LONG_RANDOM_SECRET"
```

Also add **only** the VAPID public key to `cloud-config.js` as `vapidPublicKey`. Never add the VAPID private key, Supabase secret key, or cron secret to GitHub.

## Schedule the daily check

1. In the Supabase Dashboard, enable the `pg_cron`, `pg_net` and `Vault` extensions if they are not already enabled.
2. In the SQL Editor, run the three `vault.create_secret` calls shown at the top of `schedule-loan-reminders.sql`, replacing the placeholders with your project URL, secret key, and the same cron secret configured above.
3. Run the remainder of `schedule-loan-reminders.sql` to create the daily job.
4. In Supabase Cron, confirm the job is active and inspect its run history. It runs every minute. Quest alarms are sent at configured time-range starts; due and loan reminders start at 08:00 in each device's time zone and repeat once daily while amounts remain unpaid or uncollected.

## User setup

Each device must be installed/opened in a supported browser, signed in to DayQuest, and have notifications enabled in Settings. The user chooses whether to receive reminders for loans they give, loans they take, or both. On Android, use Chrome and allow DayQuest notifications when prompted.

Daily Quest notifications are sent at the start of each configured time range. Expense and income due alerts are sent from the configured Due / collect by date at 08:00 local time and repeat once each morning while the balance remains outstanding. Loan alerts are tracked by installment; each installment sends its own reminder on its scheduled date and repeats once daily while its balance remains. Recording a payment or collection reduces the installment balance and stops its reminders when fully settled. Push notifications use the device's normal notification sound and vibration settings; the app does not supply a custom alarm audio file.
