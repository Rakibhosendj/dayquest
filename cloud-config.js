/*
 * DayQuest shared cloud configuration.
 *
 * Public browser configuration only. The Supabase publishable key is designed
 * for use in client applications. Database access is protected by Row Level
 * Security and the DayQuest family-data RPC.
 * Never put a Supabase secret key or service_role key in this file.
 */
window.DAYQUEST_CLOUD_CONFIG = Object.freeze({
  supabaseUrl: 'https://nawdixjssgtephchndix.supabase.co',
  publishableKey: 'sb_publishable_fnV7OxL7aGv8sw8lt4PX0Q_M9E4r8rg',
  // Add the matching VAPID public key after creating push-notification keys.
  vapidPublicKey: ''
});
