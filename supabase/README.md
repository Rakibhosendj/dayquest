# DayQuest Supabase push notifications

DayQuest's notification interface stores the selected preferences per registered device. Background loan reminders are sent by a Supabase Edge Function, so they can arrive while the PWA is closed.

## What is included

- `save-notification-subscription`: validates the signed-in DayQuest user and stores/removes the browser push subscription.
- `send-loan-reminders`: reads the current family loan records, respects each device's "Loans I give" / "Loans I take" preferences, and sends one reminder per outstanding loan per Dhaka calendar day from the selected due date onward.
- `20261119000000_dayquest_push_notifications.sql`: creates per-device subscription storage and duplicate-delivery protection.
- `schedule-loan-reminders.sql`: schedules a daily check at 00:05 Asia/Dhaka.

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
4. In Supabase Cron, confirm the job is active and inspect its run history. The job runs at 18:05 UTC (00:05 in Bangladesh).

## User setup

Each device must be installed/opened in a supported browser, signed in to DayQuest, and have notifications enabled in Settings. The user chooses whether to receive reminders for loans they give, loans they take, or both. On Android, use Chrome and allow DayQuest notifications when prompted.

A loan reminder is sent on its Collect by / Pay by date and repeats once per day while the loan remains outstanding. Recording a collection or repayment stops future reminders once the remaining balance reaches zero.
