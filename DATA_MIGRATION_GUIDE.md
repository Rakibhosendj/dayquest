# DayQuest Existing Data Migration

This guide moves the current browser-based DayQuest data into one shared Supabase Family Account.

## What moves to the cloud

The existing JSON backup contains the DayQuest database document. The cloud row stores that document, including existing expenses, income, quick actions, purchase bills and lines, supplier payments, inventory consumption, production batches, suppliers, product names/types/categories/units, family members, guest records, quests/checks, profile and settings represented in the backup.

The cloud schema stores one JSONB document per authenticated Family Account, not one SQL row per expense or bill. Existing app calculations and reports continue to work over that document.

## Safest migration sequence

1. On the device with the most complete current DayQuest records, open the old version.
2. Go to **Settings → Data & Backup → Export backup**.
3. Save the JSON file somewhere safe and keep a second copy outside the device.
4. Configure Supabase and publish the cloud-enabled DayQuest version using `CLOUD_SETUP_README.md`.
5. On the same original device, create the single shared Family Account using the family's email and password, verify the email, and log in.
6. When DayQuest asks whether to upload the existing local records as the first cloud copy, confirm only if this is the correct master dataset.
7. Wait for **Cloud synced**.
8. Sign in on another device with the same family email/password. Verify profile, bills, stock, members, balances and reports.

## Multiple devices with separate old local records

Old local records do not automatically synchronize just because the app is now online. Each earlier device may have a different localStorage database. Export a JSON backup from each device before migration. Choose one authoritative master backup and reconcile unique transactions from the other files before importing them. Do not overwrite the first cloud dataset with a second complete backup unless replacement is intended; duplicates or lost transactions may result from naive whole-file replacement.

## Account switching safety

If a browser previously synced a different Family Account, DayQuest downloads a JSON safety copy before switching. It will not automatically upload the previous account's local data into the newly signed-in account. First sign-in or first data migration requires an internet connection.

## Restore/import after cloud setup

1. Log in to the correct shared Family Account.
2. Open **Settings → Data & Backup → Import backup**.
3. Select the reviewed JSON backup.
4. Confirm replacement only after downloading a safety backup of the current cloud/local data.
5. Wait for **Cloud synced** before using another device.

## Conflict handling

If a device has unsynced changes while another device has saved a newer cloud version, DayQuest blocks the stale write. Download the local copy, review it, and then load the latest cloud data. The app does not automatically merge two full database documents.
