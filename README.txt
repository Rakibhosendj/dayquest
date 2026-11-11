DAYQUEST — OFFLINE EXPENSE & DAILY QUEST TRACKER

WHAT IT DOES
- Add, search, filter, edit and delete daily expenses.
- Add date-wise income entries with Cash, Bank or Due payment type.
- Record full or partial due collections later, with a separate collection date and Cash/Bank method. Income entries show collection history, collected amount and remaining due.
- Filter income by date; income entries are grouped by date and daily totals are shown.
- Overview and weekly/monthly reports show income received and due balances. Income dues are included in the 'Others owe me' report.
- Choose payment type: Cash, Bank or Due. For Due entries, choose whether you owe or someone owes you, and enter the person name.
- Due payment report with person-wise outstanding balances. Use Pay due to record payments against 'I Owe' expenses and Collect to record money received against 'Others Owe Me' expenses. Partial settlements are supported; older Due entries without direction are shown separately as unassigned.
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
- No account, analytics, cloud sync or network calls are used by the app itself.
- All records remain in the browser's local storage. Clearing Chrome/site data can erase them.
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
