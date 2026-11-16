# DayQuest Cloud Setup — One Shared Family Account

This build prepares DayQuest for one shared Family Account using **email address + password**. The same family email/password can be used on Android phones, tablets and computers. All devices access the same family data document.

> **Cloud sync is not live yet.** You must create a Supabase project, run the SQL migration, configure the public project URL/key, and publish the files before signing in. Keep your current live ZIP and JSON backup as rollback copies until the migration is verified.

## What is included

- Supabase email/password sign-up, sign-in, sign-out and password-reset flow.
- A single private data row per Supabase Auth user.
- Row Level Security (RLS) so an account can read only its own family's row.
- Version-checked writes to block silent stale overwrites from two devices.
- Local-first saves, offline queueing, reconnect sync, cloud status and manual Sync now.
- First-device migration from current localStorage data and JSON backup import.
- A shared `cloud-config.js` so the project URL and public publishable key can be configured once for every device.

The family uses one shared login: anyone with its email/password can access and change the full family record. This build does not provide separate permissions for individual family members.

## 1. Create the Supabase project

1. Open the [Supabase Dashboard](https://supabase.com/dashboard) and create a project.
2. Choose a strong database password and store it in a password manager. DayQuest does not use that database password.
3. Wait until the project is ready.
4. Copy the **Project URL** and the **Publishable key** from the project's API/Connect settings.

Use the public `sb_publishable_...` key. The legacy public `anon` key is accepted while Supabase transitions keys. **Never put an `sb_secret_...` or `service_role` key in DayQuest, GitHub Pages, `cloud-config.js`, or any browser file.** The publishable key is intended to be public; the database RLS rules are what restrict family data.

## 2. Configure one time for all devices

Open `cloud-config.js` in the project and replace the empty values:

```js
window.DAYQUEST_CLOUD_CONFIG = Object.freeze({
  supabaseUrl: 'https://YOUR-PROJECT-REF.supabase.co',
  publishableKey: 'sb_publishable_YOUR_PUBLIC_KEY'
});
```

Save and publish this file with the other DayQuest files. This way every device receives the same project URL and public key automatically; users do not need to enter them separately on each phone/computer.

If you prefer not to add the public configuration to the repository, you can leave this file blank and enter the Project URL and public key in DayQuest's **Connect DayQuest Cloud** screen on each device. The app saves that configuration in that browser only.

The Cloud connection settings screen can also store a per-device override. To change the shared deployment configuration for everyone, edit `cloud-config.js` and redeploy it.

## 3. Install the database schema and security rules

1. In the Supabase Dashboard, open **SQL Editor**.
2. Open `supabase/migrations/202611160001_dayquest_family_data.sql` in this package.
3. Copy the entire SQL file into a new SQL query and run it once.
4. Confirm the migration completes successfully.

It creates `public.dayquest_family_data`, enables Row Level Security, permits authenticated users to read only their own row, and provides `public.dayquest_save_family_data(jsonb, bigint)` for version-checked writes. Direct client table writes are revoked; writes go through the RPC so browsers cannot bypass the version check.

## 4. Configure email/password authentication

1. In Supabase, open **Authentication → Providers → Email** and ensure email/password sign-in is enabled.
2. Keep email confirmation enabled.
3. Open **Authentication → URL Configuration**.
4. Set the Site URL to the exact deployed DayQuest address, for example `https://YOUR-GITHUB-OWNER.github.io/YOUR-REPOSITORY/`.
5. Add that exact URL to the allowed Redirect URLs. Add the custom-domain URL too if you use one.
6. Configure a custom SMTP provider before regular production use, so confirmation and password-reset emails are delivered reliably. Supabase's built-in email service is intended for testing and has a low sending limit.

## 5. Publish DayQuest

1. Export a JSON backup from the currently working DayQuest installation (see the migration guide below).
2. Keep a copy of the existing deployed files/ZIP as a rollback version.
3. Extract this ZIP.
4. Copy the contents of the `DayQuest/` folder into your GitHub Pages repository, including `cloud-config.js`, `supabase/`, `index.html`, `app.js`, `style.css`, `manifest.json` and `sw.js`.
5. Commit/push the changes to the branch/folder configured for GitHub Pages.
6. Open the HTTPS Pages URL. With `cloud-config.js` configured, DayQuest should show the email/password login screen. If the file is blank, the Cloud connection screen appears first.

## 6. Create the one shared Family Account

1. On the device that currently has the most complete DayQuest records, open the newly published URL.
2. Select **Create Family Account**.
3. Enter the family name, family email and a strong password (at least 8 characters in the app), then confirm the password.
4. Confirm the email from the verification message.
5. Return to DayQuest and log in with that same email/password.
6. If no cloud row exists and the browser has old DayQuest records, the app asks before uploading those records as the first cloud copy. Confirm only after verifying this is the device with the correct master data.
7. Wait for the status bar to say **Cloud synced** before closing the page.

Do not create a different account on each device. Use the same family email/password on all devices that must share the same family records.

## 7. Migrate existing data safely

### Recommended: migrate from the main/old device

1. On the old version/device, open **Settings → Data & Backup → Export backup**.
2. Save the JSON file in a safe place. Keep another copy outside the device.
3. Deploy the cloud-enabled version and complete Supabase setup above.
4. On that same old device, create/log in to the shared Family Account.
5. If the account has no cloud data yet, confirm the prompt to upload this browser's existing DayQuest records.
6. Wait until DayQuest reports **Cloud synced**.
7. On each new device, open the same URL, sign in using the same family email/password, and confirm the family profile, purchase bills, inventory and reports appear.

### If you have old data on more than one device

Each device may have a separate local database from earlier use. The cloud migration intentionally does **not** merge separate family backups automatically, because duplicate bills, expenses and stock movements could be created. Export a JSON backup from each device first. Choose the most complete data set as the starting cloud copy; reconcile any unique entries from other backups before importing them. Do not import one entire backup over another unless you intend to replace the whole family dataset.

### Import a JSON backup after cloud login

Use **Settings → Data & Backup → Import backup**. Import replaces the current family dataset on that device and queues it for cloud sync. Export a backup first, confirm the replacement, and wait for **Cloud synced**. The app uses a version check to prevent an outdated tab from silently overwriting data changed on another device.

## 8. How sync works

- Saves write to the local browser database first, then queue a cloud save.
- The cloud write sends the current family JSON document with its expected version.
- DayQuest checks the cloud version about every 20 seconds. It does not download the full family document on every check.
- When another device has newer data, DayQuest shows **Load latest cloud data**. Save/export any local changes before loading the remote copy.
- If two devices make changes against the same old version, the server rejects the stale write and DayQuest shows a conflict. It does not attempt an automatic merge.
- Offline changes remain in that browser and try to sync after reconnecting. If another device changed the cloud in the meantime, resolve the conflict rather than forcing an overwrite.
- Use **Sync now** to send pending data or check for newer cloud data.

This is a household-scale design: one JSONB document per Family Account. It is not a multi-family organization, and it does not offer per-member roles or simultaneous record-level merging. Keep regular JSON exports as backups.

## 9. Test before entering real records

- Create and verify the shared family email account.
- Add one test expense and one test income; wait for **Cloud synced**.
- Sign in on a second device and verify both entries appear.
- Add a test purchase on device 2 and confirm device 1 sees the newer-cloud notice.
- On device 1, load the latest cloud data and confirm the purchase appears.
- Try a short offline edit, reconnect and verify sync or conflict handling.
- Test password-reset email.
- Export and re-import a JSON backup on a test account before relying on real records.

## Troubleshooting

- **Connect screen appears on each device:** either populate and deploy the shared `cloud-config.js`, or enter the same Project URL/public key once on each device.
- **Relation not found / database is not ready:** run the SQL migration in Supabase SQL Editor.
- **RPC function not found:** verify `public.dayquest_save_family_data(jsonb, bigint)` exists and the `public` schema/functions are exposed to the Supabase Data API.
- **Invalid API key / fetch error:** use the Project URL and publishable key from the same Supabase project. Do not use the database password or secret/service-role key.
- **Email confirmation doesn't return to DayQuest:** add the exact deployed URL to Supabase Authentication → URL Configuration.
- **Email does not arrive:** check spam and configure custom SMTP.
- **Old app keeps loading:** close/reopen the PWA or refresh online to install the new service-worker cache.
