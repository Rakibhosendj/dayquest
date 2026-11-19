import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

type Loan = {
  id?: string;
  type?: string;
  party?: string;
  amount?: number;
  dueDate?: string;
  settlements?: Array<{ amount?: number }>;
};

type FamilyPayload = {
  loans?: Loan[];
};

type SubscriptionRow = {
  user_id: string;
  endpoint: string;
  subscription: Record<string, unknown>;
  preferences: { enabled?: boolean; loanGiven?: boolean; loanTaken?: boolean } | null;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function dhakaDate(date = new Date()) {
  const values = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const parts = Object.fromEntries(values.map((item) => [item.type, item.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function displayDate(value: string) {
  const [year, month, day] = value.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day}-${months[Math.max(0, Number(month) - 1)]}-${year}`;
}

function outstanding(loan: Loan) {
  const amount = Math.max(0, Number(loan.amount) || 0);
  const settled = (Array.isArray(loan.settlements) ? loan.settlements : [])
    .reduce((total, item) => total + Math.max(0, Number(item.amount) || 0), 0);
  return Math.max(0, amount - settled);
}

function taka(value: number) {
  return "৳" + value.toLocaleString("en-BD", { maximumFractionDigits: 2 });
}

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const expectedSecret = Deno.env.get("DAYQUEST_CRON_SECRET") ?? "";
  const suppliedSecret = request.headers.get("x-dayquest-cron-secret") ?? "";
  if (!expectedSecret || suppliedSecret !== expectedSecret) {
    return json({ error: "Unauthorized scheduler request." }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const secretKeys = (() => {
    try { return JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}"); }
    catch { return {}; }
  })();
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SECRET_KEY") ?? secretKeys.default ?? "";
  const publicKey = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
  const privateKey = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
  const subject = Deno.env.get("VAPID_SUBJECT") ?? "";

  if (!supabaseUrl || !serviceRoleKey || !publicKey || !privateKey || !subject) {
    return json({ error: "DayQuest push credentials are not configured." }, 503);
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const today = dhakaDate();

  const { data: subscriptions, error: subscriptionError } = await admin
    .from("dayquest_notification_subscriptions")
    .select("user_id, endpoint, subscription, preferences");

  if (subscriptionError) {
    console.error("Could not load DayQuest subscriptions:", subscriptionError.message);
    return json({ error: "Could not load notification subscriptions." }, 500);
  }

  const active = (subscriptions ?? []) as SubscriptionRow[];
  const enabled = active.filter((row) => row.preferences?.enabled === true);
  const userIds = [...new Set(enabled.map((row) => row.user_id))];
  if (!userIds.length) return json({ success: true, date: today, sent: 0, reason: "No devices have enabled notifications." });

  const { data: families, error: familyError } = await admin
    .from("dayquest_family_data")
    .select("user_id, payload")
    .in("user_id", userIds);

  if (familyError) {
    console.error("Could not load DayQuest loan data:", familyError.message);
    return json({ error: "Could not load loan records." }, 500);
  }

  const familyByUser = new Map<string, FamilyPayload>(
    (families ?? []).map((row: { user_id: string; payload: FamilyPayload }) => [row.user_id, row.payload ?? {}]),
  );
  const endpointList = enabled.map((row) => row.endpoint);
  const { data: alreadySent, error: sentError } = await admin
    .from("dayquest_loan_reminder_deliveries")
    .select("endpoint, loan_id")
    .eq("reminder_date", today)
    .in("endpoint", endpointList);

  if (sentError) {
    console.error("Could not load DayQuest delivery log:", sentError.message);
    return json({ error: "Could not check reminder delivery history." }, 500);
  }

  const sentKeys = new Set((alreadySent ?? []).map((row: { endpoint: string; loan_id: string }) => `${row.endpoint}::${row.loan_id}`));
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const device of enabled) {
    const preferences = device.preferences ?? {};
    const loans = familyByUser.get(device.user_id)?.loans ?? [];

    for (const loan of loans) {
      const loanId = String(loan.id ?? "");
      const dueDate = String(loan.dueDate ?? "");
      const isTaken = loan.type === "taken";
      const preferenceEnabled = isTaken ? preferences.loanTaken !== false : preferences.loanGiven !== false;
      const balance = outstanding(loan);

      // Send on the selected collection/repayment date and continue one reminder
      // per day while a loan remains outstanding.
      if (
        !loanId ||
        !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) ||
        dueDate > today ||
        !preferenceEnabled ||
        balance <= 0.000001
      ) continue;

      const deliveryKey = `${device.endpoint}::${loanId}`;
      if (sentKeys.has(deliveryKey)) {
        skipped++;
        continue;
      }

      // Claim this device/loan/date before sending to avoid duplicate push when
      // a scheduled function invocation overlaps another one.
      const { error: claimError } = await admin
        .from("dayquest_loan_reminder_deliveries")
        .insert({
          endpoint: device.endpoint,
          user_id: device.user_id,
          loan_id: loanId,
          reminder_date: today,
        });

      if (claimError) {
        if (claimError.code === "23505") {
          skipped++;
          continue;
        }
        console.error("Could not claim reminder delivery:", claimError.message);
        failed++;
        continue;
      }

      const given = !isTaken;
      const title = given ? "Loan collection reminder" : "Loan repayment reminder";
      const party = String(loan.party || (given ? "your borrower" : "your lender"));
      const verb = given ? "collect from" : "repay to";
      const body = `${taka(balance)} remains to ${verb} ${party}. Due date: ${displayDate(dueDate)}.`;
      const payload = JSON.stringify({
        title,
        body,
        tag: `dayquest-loan-${loanId}`,
        url: "./index.html",
      });

      try {
        await webpush.sendNotification(
          device.subscription as never,
          payload,
          { TTL: 60 * 60 * 24, urgency: "high" },
        );
        sent++;
        sentKeys.add(deliveryKey);
      } catch (error) {
        const status = Number((error as { statusCode?: number })?.statusCode || 0);
        console.error("DayQuest push delivery failed:", status, String(error));
        await admin
          .from("dayquest_loan_reminder_deliveries")
          .delete()
          .eq("endpoint", device.endpoint)
          .eq("loan_id", loanId)
          .eq("reminder_date", today);

        if (status === 404 || status === 410) {
          await admin
            .from("dayquest_notification_subscriptions")
            .delete()
            .eq("user_id", device.user_id)
            .eq("endpoint", device.endpoint);
        }
        failed++;
      }
    }
  }

  return json({ success: true, date: today, sent, skipped, failed });
});
