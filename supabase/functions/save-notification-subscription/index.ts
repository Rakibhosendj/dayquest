import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authorization = request.headers.get("Authorization");
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const publishableKeys = (() => {
    try { return JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") ?? "{}"); }
    catch { return {}; }
  })();
  const secretKeys = (() => {
    try { return JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}"); }
    catch { return {}; }
  })();
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? publishableKeys.default ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SECRET_KEY") ?? secretKeys.default ?? "";

  if (!authorization || !supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: "DayQuest push service is not configured." }, 503);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  const user = userData?.user;
  if (userError || !user) return json({ error: "Sign in to DayQuest before managing notifications." }, 401);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid notification request." }, 400);
  }

  const endpoint = String(body.endpoint ?? "").trim();
  const subscription = body.subscription && typeof body.subscription === "object"
    ? body.subscription as Record<string, unknown>
    : null;
  const rawPreferences = body.preferences && typeof body.preferences === "object"
    ? body.preferences as Record<string, unknown>
    : {};
  const preferences = {
    enabled: rawPreferences.enabled === true,
    dailyQuest: rawPreferences.dailyQuest !== false,
    expenseDue: rawPreferences.expenseDue !== false,
    incomeDue: rawPreferences.incomeDue !== false,
    loanGiven: rawPreferences.loanGiven !== false,
    loanTaken: rawPreferences.loanTaken !== false,
    timeZone: String(rawPreferences.timeZone || "Asia/Dhaka").slice(0, 80),
  };

  if (!endpoint || endpoint.length > 2048 || !endpoint.startsWith("https://")) {
    return json({ error: "A valid HTTPS push endpoint is required." }, 400);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (!subscription) {
    const { error } = await admin
      .from("dayquest_notification_subscriptions")
      .delete()
      .eq("user_id", user.id)
      .eq("endpoint", endpoint);
    if (error) {
      console.error("DayQuest subscription removal failed:", error.message);
      return json({ error: "Could not remove the notification subscription." }, 500);
    }
    return json({ success: true, removed: true });
  }

  const keys = subscription.keys && typeof subscription.keys === "object"
    ? subscription.keys as Record<string, unknown>
    : {};
  if (
    String(subscription.endpoint ?? "") !== endpoint ||
    typeof keys.p256dh !== "string" ||
    typeof keys.auth !== "string" ||
    !keys.p256dh ||
    !keys.auth
  ) {
    return json({ error: "The push subscription is incomplete." }, 400);
  }

  const { error } = await admin
    .from("dayquest_notification_subscriptions")
    .upsert({
      user_id: user.id,
      endpoint,
      subscription,
      preferences,
      updated_at: new Date().toISOString(),
    }, { onConflict: "endpoint" });

  if (error) {
    console.error("DayQuest subscription save failed:", error.message);
    return json({ error: "Could not save this device's notification subscription." }, 500);
  }

  return json({ success: true, preferences });
});
