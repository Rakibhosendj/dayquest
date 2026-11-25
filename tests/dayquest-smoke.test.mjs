import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { isTrustedWebPushEndpoint } from "../supabase/functions/_shared/push-endpoint.mjs";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [app, html, css, worker, saveFunction, sendFunction] = await Promise.all([
  read("../app.js"),
  read("../index.html"),
  read("../style.css"),
  read("../sw.js"),
  read("../supabase/functions/save-notification-subscription/index.ts"),
  read("../supabase/functions/send-loan-reminders/index.ts"),
]);

test("main application JavaScript parses", () => {
  assert.doesNotThrow(() => new Function(app));
});

test("HTML has no duplicate IDs", () => {
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]);
  assert.equal(ids.length, new Set(ids).size);
});

test("all sidebar pages and report sections resolve", () => {
  const tags = [...html.matchAll(/<(?:section|div)\b[^>]*>/gi)].map((match) => match[0]);
  const panelIds = new Set(tags.filter((tag) => /\bclass=["'][^"']*\bpanel\b/.test(tag))
    .map((tag) => tag.match(/\bid=["']([^"']+)["']/)?.[1]).filter(Boolean));
  const tabTargets = [...html.matchAll(/data-tab=["']([^"']+)["']/g)].map((match) => match[1]);
  for (const target of tabTargets) assert.ok(panelIds.has(target), "missing page panel: " + target);
  const paneTargets = new Set([...html.matchAll(/data-report-pane=["']([^"']+)["']/g)].map((match) => match[1]));
  const reportTargets = [...html.matchAll(/data-report-go=["']([^"']+)["']/g)].map((match) => match[1]);
  for (const target of reportTargets) {
    if (target !== "all") assert.ok(paneTargets.has(target), "missing report pane: " + target);
  }
});

test("all seven sidebar groups start collapsed", () => {
  const contents = [...html.matchAll(/<div\b[^>]*class=["'][^"']*side-menu-section-items[^"']*["'][^>]*>/g)].map((match) => match[0]);
  assert.equal(contents.length, 7);
  assert.ok(contents.every((tag) => /\bhidden(?:=|\s|>)/.test(tag)));
});

test("creditor report renderer safely handles optional legacy DOM nodes", () => {
  assert.ok(app.includes("const creditorTotalNode=$('iOweTotal');if(creditorTotalNode)"));
  assert.ok(app.includes("const creditorDateNode=$('creditorAsOfLabel');if(creditorDateNode)"));
  assert.ok(app.includes("latestCreditorOutstandingTotal=supplierTotal+expenseOweTotal+openingCreditorTotal"));
  assert.ok(app.includes("money(latestCreditorOutstandingTotal)} outstanding"));
});

test("visible search, filter, and settings fields have accessible names", () => {
  for (const id of ["expenseSearch", "expenseFilter", "newSettingSupplier", "newProductDictionaryEnglish", "newProductDictionaryBangla", "newSettingProductType", "newSettingUnit"]) {
    const tag = html.split("\n").find((line) => line.includes('id="' + id + '"')) ?? "";
    assert.match(tag, /aria-label=/, "missing accessible label for " + id);
  }
});

test("push endpoint allowlist accepts known browser providers only", () => {
  for (const endpoint of [
    "https://fcm.googleapis.com/fcm/send/example-token",
    "https://updates.push.services.mozilla.com/wpush/v2/example-token",
    "https://web.push.apple.com/example-token",
  ]) assert.equal(isTrustedWebPushEndpoint(endpoint), true, endpoint);
  for (const endpoint of [
    "http://fcm.googleapis.com/fcm/send/example-token",
    "https://fcm.googleapis.com.evil.example/send/token",
    "https://user@fcm.googleapis.com/fcm/send/token",
    "https://fcm.googleapis.com:8443/fcm/send/token",
    "https://127.0.0.1/internal",
    "https://localhost/push",
    "https://fcm.googleapis.com",
  ]) assert.equal(isTrustedWebPushEndpoint(endpoint), false, endpoint);
});

test("both push Edge Functions validate subscriptions before storing or sending", () => {
  assert.ok(saveFunction.includes("isTrustedWebPushEndpoint(endpoint)"));
  assert.ok(sendFunction.includes("isTrustedWebPushEndpoint(device.endpoint)"));
  assert.ok(sendFunction.includes("device.subscription?.endpoint"));
});

test("CSS braces are balanced", () => {
  assert.equal((css.match(/\{/g) ?? []).length, (css.match(/\}/g) ?? []).length);
});

test("Budget create, delete, and add-product buttons have click handlers", () => {
  for (const [id, handler] of [
    ["newBudgetBtn", "createBudget"],
    ["budgetDeleteBtn", "deleteCurrentBudget"],
    ["addBudgetRowBtn", "addBudgetRow"],
  ]) {
    assert.match(app, new RegExp("\\$\\('" + id + "'\\)\\.addEventListener\\('click',\\s*" + handler + "\\)"));
    assert.equal([...html.matchAll(new RegExp('id="' + id + '"', "g"))].length, 1);
  }
});

test("Budget action buttons use compact font and spacing", () => {
  assert.match(css, /#budget button[\s\S]*?font-size:\s*11\.5px/);
  assert.match(css, /#budget \.budget-toolbar button[\s\S]*?font-size:\s*11px/);
});

test("Share Budget panel stays hidden until its own navigation tab is active", () => {
  assert.match(css, /\.budget-share-page\s*\{\s*display:\s*none;/);
  assert.match(css, /\.budget-share-page\.active\s*\{\s*display:\s*grid/);
});

test("PWA cache uses the current CSS and JavaScript asset versions", () => {
  const cssAsset = html.match(/style\.css\?v=([^"']+)/)?.[1];
  const appAsset = html.match(/app\.js\?v=([^"']+)/)?.[1];
  assert.ok(cssAsset && worker.includes("./style.css?v=" + cssAsset));
  assert.ok(appAsset && worker.includes("./app.js?v=" + appAsset));
  assert.match(app, /serviceWorker\.register\('\.\/sw\.js\?v=20261125-budget-sharing-fixes-v43'\)/);
});

test("shared Budget context is saved per account and revalidated on refresh", () => {
  assert.match(app, /dayquest_budget_share_context_v1:/);
  assert.match(app, /function primeBudgetShareContext\(\)/);
  assert.match(app, /function restoreBudgetShareContextFromList\(items\)/);
  assert.match(app, /restoreBudgetShareContextFromList\(data\)/);
  assert.match(app, /This shared Budget is view only/);
});

test("Budget summary, view, and statement use the same actual-spend calculation", () => {
  assert.match(app, /function budgetActualTotal\(plan\)/);
  assert.equal((app.match(/actual=budgetActualTotal\(plan\)/g) ?? []).length, 2);
  assert.match(app, /actual=plan\?budgetActualTotal\(plan\):0/);
});

test("revoking or deleting shared Budgets cleans up the parent share record", () => {
  assert.match(app, /p_shared_budget_id:sharedId,p_member_id:null/);
  assert.match(app, /p_shared_budget_id:item\.shared_budget_id,p_member_id:null/);
});

test("recipient cached shared Budgets are removed after access disappears", () => {
  assert.match(app, /function syncKnownSharedBudgetCopies\(items\)/);
  assert.match(app, /dayquest_shared_budget_keys_v1:/);
  assert.match(app, /syncKnownSharedBudgetCopies\(data\)/);
  assert.match(app, /delete db\.budgetPlans\[saved\.budget_key\]/);
});
