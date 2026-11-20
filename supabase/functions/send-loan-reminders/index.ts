import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

type Settlement = { amount?: number; date?: string; installmentId?: string | null };
type Installment = { id?: string; dueDate?: string; amount?: number };
type Loan = {
  id?: string; type?: string; party?: string; amount?: number; dueDate?: string;
  settlements?: Settlement[]; installments?: Installment[];
};
type Expense = {
  id?: string; name?: string; category?: string; paymentType?: string;
  dueDirection?: string; duePerson?: string; dueDate?: string; amount?: number;
  settlements?: Settlement[];
};
type Income = {
  id?: string; source?: string; duePerson?: string; dueDate?: string;
  paymentType?: string; amount?: number; collections?: Settlement[];
  salesMemo?: { memoNo?: string; customerName?: string };
};
type Quest = {
  id?: string; title?: string; date?: string; startDate?: string; endDate?: string;
  repeat?: string; repeatDays?: (string | number)[];
  timeRanges?: Array<{ start?: string; end?: string }>;
  reminderTime?: string;
};
type FamilyPayload = { loans?: Loan[]; expenses?: Expense[]; incomes?: Income[]; quests?: Quest[]; checks?: Record<string, unknown> };
type SubscriptionRow = {
  user_id: string; endpoint: string; subscription: Record<string, unknown>;
  preferences: {
    enabled?: boolean; dailyQuest?: boolean; expenseDue?: boolean; incomeDue?: boolean;
    loanGiven?: boolean; loanTaken?: boolean; timeZone?: string;
  } | null;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}
function partsFor(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}
function safeTimeZone(value: unknown) {
  const zone = String(value || "Asia/Dhaka");
  try { new Intl.DateTimeFormat("en-GB", { timeZone: zone }).format(new Date()); return zone; }
  catch { return "Asia/Dhaka"; }
}
function money(value: number) {
  return "৳" + value.toLocaleString("en-BD", { maximumFractionDigits: 2 });
}
function validDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}
function totalSettled(entries: Settlement[] | undefined) {
  return (Array.isArray(entries) ? entries : []).reduce((total, item) => total + Math.max(0, Number(item.amount) || 0), 0);
}
function loanInstallmentBalances(loan: Loan) {
  const installments = (Array.isArray(loan.installments) ? loan.installments : [])
    .slice().sort((a, b) => String(a.dueDate || "").localeCompare(String(b.dueDate || "")));
  if (!installments.length) return [];
  const balances = new Map<string, number>();
  for (const item of installments) balances.set(String(item.id || ""), Math.max(0, Number(item.amount) || 0));
  const settlements = (Array.isArray(loan.settlements) ? loan.settlements : [])
    .slice().sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));
  for (const item of settlements) {
    const id = String(item.installmentId || "");
    if (id && balances.has(id)) balances.set(id, Math.max(0, (balances.get(id) || 0) - Math.max(0, Number(item.amount) || 0)));
  }
  let unassigned = settlements.filter((item) => !item.installmentId).reduce((sum, item) => sum + Math.max(0, Number(item.amount) || 0), 0);
  for (const installment of installments) {
    if (unassigned <= 0) break;
    const id = String(installment.id || ""), open = balances.get(id) || 0;
    const applied = Math.min(open, unassigned);
    balances.set(id, open - applied);
    unassigned -= applied;
  }
  return installments.map((item) => ({ installment: item, outstanding: balances.get(String(item.id || "")) || 0 }));
}
function questIsScheduled(quest: Quest, date: string) {
  const start = String(quest.startDate || quest.date || "");
  const end = String(quest.endDate || "9999-12-31");
  if ((start && date < start) || date > end) return false;
  const weekday = String(new Date(date + "T12:00:00Z").getUTCDay());
  if (Array.isArray(quest.repeatDays) && quest.repeatDays.length) return quest.repeatDays.map(String).includes(weekday);
  return quest.repeat === "daily" || String(quest.date || "") === date;
}
function questTimeRanges(quest: Quest) {
  const rows = Array.isArray(quest.timeRanges) ? quest.timeRanges : [];
  const valid = rows.filter((item) => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(item.start || "")) && /^([01]\d|2[0-3]):[0-5]\d$/.test(String(item.end || "")));
  return valid.length ? valid : [{ start: String(quest.reminderTime || "08:00"), end: "09:00" }];
}
function remainingDue(amount: unknown, entries: Settlement[] | undefined) {
  return Math.max(0, (Number(amount) || 0) - totalSettled(entries));
}

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const expectedSecret = Deno.env.get("DAYQUEST_CRON_SECRET") ?? "";
  if (!expectedSecret || request.headers.get("x-dayquest-cron-secret") !== expectedSecret) {
    return json({ error: "Unauthorized scheduler request." }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const secretKeys = (() => { try { return JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}"); } catch { return {}; } })();
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SECRET_KEY") ?? secretKeys.default ?? "";
  const publicKey = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
  const privateKey = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
  const subject = Deno.env.get("VAPID_SUBJECT") ?? "";
  if (!supabaseUrl || !serviceRoleKey || !publicKey || !privateKey || !subject) return json({ error: "DayQuest push credentials are not configured." }, 503);

  webpush.setVapidDetails(subject, publicKey, privateKey);
  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: subscriptions, error: subError } = await admin
    .from("dayquest_notification_subscriptions")
    .select("user_id, endpoint, subscription, preferences");
  if (subError) return json({ error: "Could not load notification subscriptions." }, 500);
  const active = ((subscriptions ?? []) as SubscriptionRow[]).filter((row) => row.preferences?.enabled === true);
  const userIds = [...new Set(active.map((row) => row.user_id))];
  if (!userIds.length) return json({ success: true, sent: 0, reason: "No devices have enabled notifications." });

  const { data: families, error: familyError } = await admin
    .from("dayquest_family_data").select("user_id, payload").in("user_id", userIds);
  if (familyError) return json({ error: "Could not load DayQuest family records." }, 500);
  const familyByUser = new Map<string, FamilyPayload>((families ?? []).map((row: { user_id: string; payload: FamilyPayload }) => [row.user_id, row.payload ?? {}]));

  let sent = 0, skipped = 0, failed = 0;
  const globalNow = new Date();

  async function deliver(device: SubscriptionRow, eventKey: string, date: string, title: string, body: string, tag: string) {
    const { error: claimError } = await admin.from("dayquest_loan_reminder_deliveries").insert({
      endpoint: device.endpoint, user_id: device.user_id, loan_id: eventKey, reminder_date: date,
    });
    if (claimError) {
      if (claimError.code === "23505") { skipped++; return; }
      console.error("DayQuest reminder claim failed:", claimError.message); failed++; return;
    }
    try {
      await webpush.sendNotification(device.subscription as never, JSON.stringify({
        title, body, tag, url: "./index.html",
      }), { TTL: 60 * 60 * 24, urgency: "high" });
      sent++;
    } catch (error) {
      const status = Number((error as { statusCode?: number })?.statusCode || 0);
      console.error("DayQuest push delivery failed:", status, String(error));
      await admin.from("dayquest_loan_reminder_deliveries").delete()
        .eq("endpoint", device.endpoint).eq("loan_id", eventKey).eq("reminder_date", date);
      if (status === 404 || status === 410) {
        await admin.from("dayquest_notification_subscriptions").delete()
          .eq("user_id", device.user_id).eq("endpoint", device.endpoint);
      }
      failed++;
    }
  }

  for (const device of active) {
    const preferences = device.preferences ?? {};
    const timeZone = safeTimeZone(preferences.timeZone);
    const local = partsFor(globalNow, timeZone);
    const date = local.year + "-" + local.month + "-" + local.day;
    const minuteOfDay = Number(local.hour) * 60 + Number(local.minute);
    const family = familyByUser.get(device.user_id) ?? {};

    // Daily Quest alarm: fire at the configured start of each range in this
    // device's own time zone. A two-minute grace window tolerates cron jitter.
    if (preferences.dailyQuest !== false) {
      for (const quest of family.quests ?? []) {
        const questId = String(quest.id || "");
        if (!questId || !questIsScheduled(quest, date)) continue;
        const ranges = questTimeRanges(quest);
        for (let index = 0; index < ranges.length; index++) {
          const start = String(ranges[index].start || "08:00");
          const [hour, minute] = start.split(":").map(Number);
          const startMinute = hour * 60 + minute;
          if (minuteOfDay < startMinute || minuteOfDay > startMinute + 2) continue;
          const key = "quest::" + questId + "::range-" + index;
          const title = "Daily Quest alarm";
          const questTitle = String(quest.title || "Your quest");
          const end = String(ranges[index].end || "");
          const body = questTitle + " starts now" + (end ? " (" + start + "–" + end + ")." : ".");
          await deliver(device, key, date, title, body, "dayquest-" + key + "-" + date);
        }
      }
    }

    // Expense dues: alert at 08:00 local on the due date and each following
    // morning until the full amount is paid or collected.
    if (preferences.expenseDue !== false && minuteOfDay >= 8 * 60) {
      for (const expense of family.expenses ?? []) {
        if (expense.paymentType !== "Due" || !validDate(expense.dueDate) || expense.dueDate > date) continue;
        const remaining = remainingDue(expense.amount, expense.settlements);
        if (remaining <= 0.000001) continue;
        const id = String(expense.id || "");
        if (!id) continue;
        const collecting = expense.dueDirection === "owed_to_me";
        const action = collecting ? "Collect" : "Pay";
        const person = String(expense.duePerson || "the other person");
        const name = String(expense.name || expense.category || "Expense due");
        const body = action + " " + money(remaining) + " for " + name + " " + (collecting ? "from " : "to ") + person + ". Due date: " + expense.dueDate + ".";
        await deliver(device, "expense-due::" + id, date, "DayQuest expense due reminder", body, "dayquest-expense-due-" + id + "-" + date);
      }
    }

    // Income dues (including Due sales memos): alert on the collect-by date
    // and each following morning while any amount remains outstanding.
    if (preferences.incomeDue !== false && minuteOfDay >= 8 * 60) {
      for (const income of family.incomes ?? []) {
        if (income.paymentType !== "Due" || !validDate(income.dueDate) || income.dueDate > date) continue;
        const remaining = remainingDue(income.amount, income.collections);
        if (remaining <= 0.000001) continue;
        const id = String(income.id || "");
        if (!id) continue;
        const who = String(income.duePerson || income.salesMemo?.customerName || "the customer");
        const source = income.salesMemo?.memoNo ? "sales memo " + income.salesMemo.memoNo : String(income.source || "Income");
        const body = "Collect " + money(remaining) + " for " + source + " from " + who + ". Collect-by date: " + income.dueDate + ".";
        await deliver(device, "income-due::" + id, date, "DayQuest income collection reminder", body, "dayquest-income-due-" + id + "-" + date);
      }
    }

    // Loans: each installment is tracked independently. Legacy single-date
    // loans are normalized to a single installment; old unlinked settlements
    // are applied to the earliest unpaid installment first.
    if (minuteOfDay >= 8 * 60) {
      for (const loan of family.loans ?? []) {
        const loanId = String(loan.id || "");
        if (!loanId) continue;
        const given = loan.type !== "taken";
        if (given ? preferences.loanGiven === false : preferences.loanTaken === false) continue;
        const installments = (Array.isArray(loan.installments) && loan.installments.length)
          ? loan.installments
          : (validDate(loan.dueDate) ? [{ id: "legacy-" + loanId, dueDate: loan.dueDate, amount: loan.amount }] : []);
        const balances = loanInstallmentBalances({ ...loan, installments });
        for (const row of balances) {
          const installment = row.installment;
          const dueDate = String(installment.dueDate || "");
          if (!validDate(dueDate) || dueDate > date || row.outstanding <= 0.000001) continue;
          const installmentId = String(installment.id || "one");
          const action = given ? "collect from" : "repay to";
          const body = money(row.outstanding) + " remains to " + action + " " + String(loan.party || (given ? "your borrower" : "your lender")) +
            " for installment due " + dueDate + ".";
          const title = given ? "Loan installment collection reminder" : "Loan installment repayment reminder";
          const key = "loan::" + loanId + "::installment::" + installmentId;
          await deliver(device, key, date, title, body, "dayquest-" + key + "-" + date);
        }
      }
    }
  }
  return json({ success: true, sent, skipped, failed, checkedAt: globalNow.toISOString() });
});
