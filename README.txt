DAYQUEST — OFFLINE EXPENSE & DAILY QUEST TRACKER

WHAT IT DOES
- Add, search, filter, edit and delete daily expenses.
- Add date-wise income entries with separate Income Type (Salary, Business, Sales, Freelance, Rent, Gift, Other) and Income By (person who earned it) fields; add custom income types and custom people.
- Record full or partial due collections later, with a separate collection date and Cash/Bank method. Income entries show collection history, collected amount and remaining due.
- Filter income by date, Income Type and Income By person; income entries are grouped by date and daily totals are shown.
- Weekly/monthly income reports can be filtered by the person who earned the income, with separate summaries by person and Income Type.
- Overview and weekly/monthly reports show income received, due balances, income-by-head summaries and live earned/cash/bank balances.
- Choose payment type: Cash, Bank or Due. For Due entries, choose whether you owe or someone owes you, and enter the person name. For an 'Others Owe Me' expense, choose whether the expense was paid from Cash or Bank.
- Due payment report with person-wise outstanding balances. Profile stores your name, phone and opening cash/bank amounts. Earned balance is calculated from opening balances plus received income and collections minus expense outflows and paid dues. Use Pay due to record payments against 'I Owe' expenses and Collect to record money received against 'Others Owe Me' expenses. Partial settlements are supported; older Due entries without direction are shown separately as unassigned.
- Select expense names and add your own names; select units and add custom units.
- Enter quantity and rate; total expense is calculated automatically.
- Categories: Food, Transport, Shopping, Bills, Health, Education, Entertainment, Other.
- Create daily repeating quests or one-day quests with a configurable number of checkboxes and an achievement value for each check. The app displays checked times and the running total achieved (for example, 5 checks × 2 each = 10).
- Overview with today's spending, weekly/monthly totals and today's quest progress.
- Weekly and monthly reports, daily spending bars, category breakdown, quest completion rate and a separate all-time due payment report.
- Export/import a JSON backup. Data is stored locally in this browser on this device.

ANDROID INSTALL (PWA)
1. Upload the contents of this folder to a static HTTPS host (for example GitHub Pages).
   Service workers require HTTPS (or localhost); opening index.html directly from Files
   will let the page run, but offline app installation/caching may not work.
2. Open the hosted HTTPS address in Chrome on your Android phone while online.
3. Use Chrome menu (⋮) > Install app or Add to Home screen.
4. Open DayQuest once while online. After its files are cached, it works offline.
5. Export a backup from Reports > Data & backup before clearing browser data or changing phones.

PRIVACY / LIMITATIONS
- A first-use local login screen can be set up with a username and password. The password is stored as a salted PBKDF2 hash in this browser.
- The login is only a device-level screen. GitHub Pages is static hosting, so this is not server-side authentication, does not create secure multi-user accounts, and does not sync logins or data between devices.
- No cloud sync or analytics are used by the app itself. All records remain in this browser's local storage. Clearing Chrome/site data can erase them.
- Currency is shown as Bangladeshi taka (৳). Change the money() function in app.js if you
  prefer another currency.
- This is an installable offline web app (PWA), not a Play Store APK.


Saved expense editing
- Open Expenses and tap Edit beside a saved expense.
- Change any field and tap Update expense.
- Tap Cancel edit to leave the saved entry unchanged.
- Editing updates the existing expense record instead of creating a duplicate.


Income and due collection
- Open Income and enter an income source, amount, payment type and date.
- Select Due when the customer/person has not paid yet, then enter their name.
- In the saved income list, tap Collect to record full or partial payment received later. Choose collection date and Cash or Bank.
- The outstanding due decreases automatically; once fully collected, the entry is marked Fully collected.
- Export a fresh backup after entering income records so they are included in your backup file.
- Expense due payments and collections are recorded as settlements with amount, date, method and note; outstanding balances decrease automatically.


Saved expense list layout (mobile)
- Saved expenses now remain in a compact horizontal row on phone screens.
- The amount and Edit / Delete / Pay due / Collect actions stay aligned on the right.
- Long expense titles are shortened with an ellipsis and supporting details wrap to two lines.


Profile and balances
- Open Profile to save your name, phone and starting cash/bank balances.
- Earned balance is calculated as cash plus bank balance, using opening balances and saved transactions.
- Cash/Bank income increases the matching balance. Cash/Bank expenses decrease the matching balance.
- Due income increases balance only when it is collected; each collection adds to the selected Cash or Bank account.
- An expense marked I Owe decreases balance when you record a Pay Due settlement.
- An expense marked Others Owe Me is counted as an expense when entered (select Paid from Cash or Bank); later collections add money back to the selected account.
- Income types can be selected repeatedly, and new types or earners can be added using Add type or Add person.
- Desktop typography uses explicit system font fallbacks to avoid Symbol-font substitution.


DESKTOP FONT DISPLAY FIX (2026-11-11)
- Updated the font stack to use the operating system UI font first (system-ui / Segoe UI / Tahoma / Arial).
- Added explicit font rules for form controls and disabled unusual font substitutions/ligatures.
- Added a versioned CSS and JavaScript URL so browsers do not reuse stale copies.
- Updated the service worker to activate immediately, claim open tabs, and refresh cached app files from the network when online while retaining offline fallback.

After uploading to GitHub Pages, open the site and press Ctrl+Shift+R. If an old page remains open, close all DayQuest tabs/windows and reopen the site. This update does not clear localStorage, so it does not remove saved app data.


LOCAL LOGIN
- On first launch, create a username and a password with at least 8 characters.
- On later visits, enter the username and password to open DayQuest. The session stays open in the current browser tab until you log out or the tab session ends.
- Use Log out in the top-right header to lock the app.
- If you forget the password, choose 'Forgot password? Reset this device login' on the login screen. This resets only the local login; it does not delete expenses, income, quests or profile data.
- This local login is for convenience, not high-security protection. Anyone who can access browser storage or developer tools may bypass it. Do not use this as a substitute for server authentication when protecting sensitive or shared financial data.

INCOME TYPE AND INCOME BY PERSON
- Income Type describes where the money came from, such as Salary, Business, Sales, Freelance, Rent, Gift or a custom type.
- Income By identifies the person who earned the money. Select an existing person or use Add person to register another earner. Your Profile name is offered as a default person.
- Older income records without an earner are kept as Unassigned; edit those records to attribute them to a person.
- In the Income tab, filter by Income Type, Income By person and date.
- In Reports, use Show person to view one person or everyone for the selected week/month. The report shows totals by person and a separate breakdown by Income Type.


PURCHASE BILLS, SUPPLIER CREDITORS AND PRODUCT CONSUMPTION
- Open Expenses > Purchase bill entry to record one supplier bill with multiple product lines.
- Each line stores product name, optional pack size/specification (for example 300 gram), quantity, unit, rate per unit and line amount.
- Enter how much was paid immediately by Cash and by Bank. The remaining amount is calculated automatically as Credit / payable to supplier. Cash and Bank portions reduce those balances on the bill date; credit is shown as a supplier liability and reduces the selected balance only when a later supplier payment is recorded.
- Saving a bill creates/updates the supplier account. Open a supplier such as Rahman Store to see bill dates, bill totals, individual products, quantities, units, rates, line amounts, cash/bank/credit split, remaining credit and payment history.
- Use Pay supplier due in the supplier account for full or partial payments. Choose the payment date and whether the payment came from Cash or Bank. Payments reduce the supplier's outstanding creditor balance and the matching cash/bank balance.
- Purchase bills are included in today's, weekly and monthly spending totals, category reports, and expense reports. Individual product purchase costs appear in Reports > Product consumption & expense report.
- Recording a purchase increases product stock. To track actual use, enter each use under Expenses > Record product consumption. Select the product, quantity, unit and date. The app prevents consumption above recorded stock. Supported conversions include g/kg/mg and ml/litre; other units are tracked separately.
- The product report shows quantity purchased, quantity consumed, current stock, purchase expense by individual product and estimated consumption cost using the product's weighted average purchase cost. Recording consumption does not deduct cash a second time; the cash/bank outflow was recorded when the bill was paid.
- Bills with supplier payments or linked consumption are protected from edit/delete to avoid breaking the supplier and stock ledgers. Make a backup before changing records.
- All purchase bills, supplier payments and consumption records are included in the JSON backup and remain on this browser/device (no cloud sync).

PRODUCT CATALOG
- Use + Add New Product at the top of Purchase bill entry to save a product name before creating a bill. It fills the first empty product line automatically.
- When entering bill lines, click/type in Product name to see saved product suggestions. Choose a saved name or type a new one.
- Add another line adds a further product row to the current supplier bill.
