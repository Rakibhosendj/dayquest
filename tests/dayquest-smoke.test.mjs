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
  assert.match(app, /serviceWorker\.register\('\.\/sw\.js\?v=20261126-budget-page-v50'\)/);
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
  assert.match(app, /function renderBudgetView\(\)[\s\S]*?actual=budgetActualTotal\(plan\)/);
  assert.match(app, /function budgetStatementHtml\(plan\)[\s\S]*?actual=budgetActualTotal\(plan\)/);
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

test("Budget landing page has Recent Budgets and a separate Create Budget page", () => {
  assert.match(html, /id="recentBudgetList"/);
  assert.match(html, /id="budgetCreatePage" class="panel budget-create-page"/);
  assert.match(html, /id="newBudgetBtn"[^>]*>＋ Create</);
  assert.match(app, /function openBudgetPlan\(key\)/);
  assert.match(app, /if\(t==='budgetCreatePage'\)renderBudgetCreatePage\(\)/);
});
test("Create Budget has compact date rows and editable Name Q R T columns", () => {
  for (const id of ["budgetName","budgetHeaderFrom","budgetHeaderTo","budgetHeaderSaveBtn","budgetLoadFromDate","budgetLoadToDate","budgetLoadShowBtn","budgetLoadDeleteBtn","budgetList","addBudgetRowBtn"]) assert.ok(html.includes('id="' + id + '"'));
  assert.ok(app.includes('<th>Name</th><th>Q</th><th>R</th><th>T</th>'));
  for (const field of ["product","quantity","rate","total"]) assert.ok(app.includes('data-field="' + field + '"'));
  assert.match(app,/function updateBudgetRowFromInput\(event\)/);
});
test("Entering Total recalculates Rate or Quantity", () => {
  assert.ok(app.includes("if(field==='total')"));
  assert.ok(app.includes("row.rate=Number((total/quantity).toFixed(4))"));
  assert.ok(app.includes("row.quantity=Number((total/rate).toFixed(4))"));
});
test("Show displays purchased products separately without changing the planned Budget", () => {
  const show = app.slice(app.indexOf("async function showPurchasedProductsInBudget"), app.indexOf("async function deleteCurrentBudget"));
  assert.match(show,/renderBudgetPurchaseResults\(from,to\)/);
  assert.doesNotMatch(show,/plan\.rows\s*=|localSaveOnly\(|syncActiveSharedBudget\(/);
  assert.ok(html.includes('id="budgetPurchaseResults"'));
  assert.match(html,/budget-purchase-results/);
});
test("Budget planned rows have a selectable unit and unit-compatible actual matching", () => {
  assert.ok(app.includes('data-field="unit"'));
  assert.match(app,/function budgetRowMatchKey\(row\)[\s\S]*?row\.unit/);
  assert.match(app,/function budgetSpecsCompatible\(left,right\)/);
  assert.match(app,/unitConversionRatio\(row\.unit\|\|'pcs',group\.unit\|\|'pcs'\)/);
  assert.ok(app.includes("latestPurchaseRateForProduct(product,unit)"));
});
test("Product autosave does not save uncommitted Budget header dates", () => {
  assert.ok(app.includes("saveBudget({silent:true,productsOnly:true})"));
  assert.ok(app.includes("options.productsOnly?plan.from"));
  assert.ok(app.includes("if(!options.productsOnly){plan.name=name;plan.from=from;plan.to=to}"));
});
test("Invalid Budget rows show inline validation instead of silently appearing saved", () => {
  assert.ok(html.includes('id="budgetEditorStatus"'));
  assert.match(app,/function updateBudgetEditorValidation\(\)/);
  assert.match(app,/Enter a quantity greater than 0\./);
});
test("Older Budgets can be opened from All Budgets", () => {
  assert.ok(html.includes('id="budgetShowAllBtn"'));
  assert.ok(app.includes("showAllBudgetEntries?entries:entries.slice(0,8)"));
});
test("Budget deletion uses the branded confirmation dialog", () => {
  assert.match(app,/window\.dayQuestConfirm\('Delete Budget/);
  assert.doesNotMatch(app,/if\(!confirm\('Delete/);
});
test("Budget editor uses app title and Back navigation", () => {
  assert.ok(app.includes("budgetCreatePage:'Create Budget'"));
  assert.ok(app.includes("['budgetViewPage','budgetCreatePage'].includes(t)?'budget':t"));
});

test("New Budget purchase filters remain blank until save, then default to the prior dates in the budget month", () => {
  const createPage = app.slice(app.indexOf("function renderBudgetCreatePage()"), app.indexOf("function openBudgetProductRowFocus()"));
  assert.match(createPage, /if\(plan\)\{/);
  assert.match(createPage, /budgetPurchaseDefaultRange\(range\.from\)/);
  assert.match(createPage, /defaults\.from/);
  assert.match(createPage, /defaults\.to/);
  assert.match(app,/function budgetPurchaseDefaultRange\(startDate\)/);
  assert.match(app,/purchaseDefaults=budgetPurchaseDefaultRange\(from\)/);
});

test("Saving a new Budget keeps its selected key and refreshes Recent Budgets and the product table", () => {
  assert.match(app,/function currentBudgetPlan\(\)[\s\S]*?candidates=\[activeBudgetKey,select\?\.value\]/);
  assert.match(app,/let savedKey=activeBudgetKey/);
  assert.match(app,/renderBudget\(\);activeBudgetKey=savedKey/);
  assert.match(app,/renderBudgetCreatePage\(\);[\s\S]*?if\(!currentBudgetPlan\(\)\)/);
  assert.match(app,/Budget is now in Recent Budgets/);
});
test("Budget editor actions are reachable after saving and have explicit handlers", () => {
  for (const [id,handler] of [
    ["budgetHeaderSaveBtn","saveBudgetHeader"],
    ["budgetLoadShowBtn","showPurchasedProductsInBudget"],
    ["budgetLoadDeleteBtn","deleteCurrentBudget"],
    ["addBudgetRowBtn","addBudgetRow"],
  ]) assert.match(app,new RegExp("\\$\\('" + id + "'\\)\\.addEventListener\\('click',\\s*" + handler + "\\)"));
  assert.ok(html.includes('id="budgetBackRecentBtn"'));
  assert.ok(app.includes("budgetBackRecentBtn"));
  assert.ok(app.includes('id="budgetList"')===false || html.includes('id="budgetList"'));
});

test("Historical purchases can be imported explicitly into Planned Products without changing actual purchase records", () => {
  assert.match(app,/function collectBudgetPurchaseRows\(from,to\)/);
  assert.match(app,/function budgetPurchaseImportPreview\(rows,plan\)/);
  const importer = app.slice(app.indexOf("async function importBudgetPurchasesToPlan"), app.indexOf("function budgetRowError"));
  assert.match(importer,/date:targetDate/);
  assert.match(importer,/sourcePurchaseKeys:/);
  assert.match(importer,/sourcePurchaseRange:/);
  assert.match(importer,/plan\.rows\.push\(/);
  assert.match(importer,/localSaveOnly\(\)/);
  assert.match(importer,/await syncActiveSharedBudget\(\)/);
  assert.match(app,/id="budgetImportPurchasesBtn"/);
  assert.match(app,/importButton\.addEventListener\('click',importBudgetPurchasesToPlan\)/);
  const show = app.slice(app.indexOf("function showPurchasedProductsInBudget"), app.indexOf("async function deleteCurrentBudget"));
  assert.doesNotMatch(show,/plan\.rows\s*=|localSaveOnly\(|syncActiveSharedBudget\(/);
});
test("Budget import prevents duplicate purchase rows and protects manually planned products", () => {
  const preview = app.slice(app.indexOf("function budgetPurchaseImportPreview"), app.indexOf("function renderBudgetPurchaseResults"));
  assert.match(preview,/sourcePurchaseKeys/);
  assert.match(preview,/importedKeys\.has/);
  assert.match(preview,/manualKeys/);
  assert.match(preview,/alreadyPlanned/);
  assert.match(app,/existingImportedRow/);
  assert.match(app,/sourcePurchaseDates:/);
});
test("Historical Budget import controls are responsive and assets are cache-version aligned", () => {
  assert.match(css,/#budgetCreatePage \.budget-purchase-import-actions/);
  assert.match(css,/#budgetCreatePage \.budget-import-purchases/);
  const cssAsset=html.match(/style\.css\?v=([^"']+)/)?.[1];
  const appAsset=html.match(/app\.js\?v=([^"']+)/)?.[1];
  assert.ok(cssAsset&&worker.includes("./style.css?v="+cssAsset));
  assert.ok(appAsset&&worker.includes("./app.js?v="+appAsset));
  assert.match(app,/serviceWorker\.register\('\.\/sw\.js\?v=20261126-budget-page-v50'\)/);
});

test("Filled Budget purchase date labels hide only the caption, never the date-entry control", () => {
  assert.match(css,/#budgetCreatePage \.budget-filter-date\.is-filled>span:first-child\{display:none\}/);
  assert.match(css,/#budgetCreatePage \.budget-filter-date\.is-filled>\.dq-date-wrap\{display:flex\}/);
});
test("Saved Budgets keep the previous-purchase filter available and preserve its values", () => {
  assert.match(app,/function budgetPurchaseDefaultRange\(startDate\)/);
  assert.match(app,/const purchaseDefaults=budgetPurchaseDefaultRange\(from\)/);
  assert.match(app,/syncDQDateDisplay\(\$\('budgetLoadFromDate'\)\)/);
  assert.match(app,/function showPurchasedProductsInBudget\(\)[\s\S]*?renderBudgetPurchaseResults\(from,to\)/);
  const editor=app.slice(app.indexOf("function renderBudgetCreatePage"),app.indexOf("function openBudgetProductRowFocus"));
  assert.doesNotMatch(editor,/budgetPurchaseResults'\)\.hidden=true/);
});
test("Share and Details are enabled for a saved Budget before products are added", () => {
  assert.match(app,/\$\('budgetShareBtn'\)\.disabled=!plan\|\|readOnly\|\|shared/);
  assert.match(app,/\$\('budgetViewBtn'\)\.disabled=!plan;/);
  assert.match(app,/if\(\$\('budgetShareBtn'\)\)\$\('budgetShareBtn'\)\.disabled=!plan\|\|shared/);
  assert.match(app,/if\(\$\('budgetViewBtn'\)\)\$\('budgetViewBtn'\)\.disabled=!plan/);
});
test("A saved Budget editor displays a saved-state hint and counts only named products", () => {
  assert.match(app,/Saved\. Add products with ＋/);
  assert.ok(app.includes("filter(row=>String(row.querySelector('[data-field=\"product\"]')?.value||'').trim())"));
});

test("Budget selection recovers a saved plan from the visible name and date range", () => {
  assert.match(app,/function budgetPlanMatchingCurrentHeader\(entries=budgetPlanEntries\(\)\)/);
  assert.match(app,/budgetPlanMatchingCurrentHeader\(entries\)\?\.\[0\]/);
  assert.match(app,/budgetPlanMatchingCurrentHeader\(entries\)\?\.\[0\]\|\|''/);
});
