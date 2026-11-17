// Deploy as Supabase Edge Function: delete-account
// Add DAYQUEST_SERVICE_ROLE_KEY as a server-side function secret.
// Never put the service-role key in browser code or share it with users.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.replace(/\/+$/, "");
    const serviceKey = Deno.env.get("DAYQUEST_SERVICE_ROLE_KEY");
    // The Supabase client sends the project's publishable key in the apikey header.
    // Accept it from the request so newer projects do not need a legacy anon-key secret.
    const publicKey = req.headers.get("apikey") || Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
    if (!supabaseUrl || !serviceKey || !publicKey) {
      return json({ error: "The secure account deletion function is not fully configured. Check its server-side service-role secret." }, 500);
    }

    const authorization = req.headers.get("Authorization") || "";
    const tokenMatch = /^Bearer\s+(.+)$/i.exec(authorization);
    if (!tokenMatch) return json({ error: "Sign in again before deleting the account." }, 401);

    // Validate the caller's access token with Supabase Auth. Never trust a user ID from the browser.
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: publicKey, Authorization: `Bearer ${tokenMatch[1]}` },
    });
    if (!userResponse.ok) return json({ error: "Your session could not be verified. Please sign in again." }, 401);
    const user = await userResponse.json();
    if (!user?.id) return json({ error: "The signed-in account could not be identified." }, 401);

    // Remove the shared DayQuest cloud payload before removing its owner.
    const dataResponse = await fetch(
      `${supabaseUrl}/rest/v1/dayquest_family_data?user_id=eq.${encodeURIComponent(user.id)}`,
      {
        method: "DELETE",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          Prefer: "return=minimal",
        },
      },
    );
    if (!dataResponse.ok) {
      const detail = await dataResponse.text();
      console.error("DayQuest cloud data deletion failed:", dataResponse.status, detail);
      return json({ error: "DayQuest could not remove the family's cloud records. The login account was not deleted." }, 502);
    }

    // The privileged key exists only in this server-side function.
    const deleteResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(user.id)}`, {
      method: "DELETE",
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    if (!deleteResponse.ok) {
      const detail = await deleteResponse.text();
      console.error("Supabase Auth user deletion failed:", deleteResponse.status, detail);
      return json({ error: "Cloud records were removed, but Supabase could not delete the login. Please contact the DayQuest administrator." }, 502);
    }

    return json({ success: true });
  } catch (error) {
    console.error("delete-account function error:", error);
    return json({ error: "The account deletion request could not be completed." }, 500);
  }
});
