DAYQUEST — OFFLINE EXPENSE & DAILY QUEST TRACKER

WHAT IT DOES
- Add, search, filter, edit and delete daily expenses from the Expenses → Add / manage expenses sidebar submenu.
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
- Sidebar organization: Expenses → Purchase; Inventory; Supplier accounts / creditors; Outstanding → Pay or collect an expense due.

ANDROID INSTALL (PWA)
1. Upload the contents of this folder to a static HTTPS host (for example GitHub Pages).
   Service workers require HTTPS (or localhost); opening index.html directly from Files
   will let the page run, but offline app installation/caching may not work.
2. Open the hosted HTTPS address in Chrome on your Android phone while online.
3. Use Chrome menu (⋮) > Install app or Add to Home screen.
4. Open DayQuest once while online. After its files are cached, it works offline.
5. Export a backup from Settings > Data & backup before clearing browser data or changing phones.
6. For shared Family Account login and cloud sync, complete the steps in CLOUD_SETUP_README.md and run the SQL migration in supabase/migrations.

CLOUD FAMILY ACCOUNT (NEW IN THIS BUILD)
- DayQuest now supports one shared Family Account using Supabase email/password authentication. Use the same email and password on each device.
- Configure the shared Supabase Project URL and public publishable key once in cloud-config.js before deployment. All devices then use the same cloud project. Alternatively, enter the same values on each device in Connect DayQuest Cloud. Never enter a service-role or secret key.
- Family data is stored in one private JSONB document per Supabase Auth user. PostgreSQL Row Level Security allows each authenticated account to read only its own row. Direct table writes are revoked; writes use a version-checked RPC. Run supabase/migrations/202611160001_dayquest_family_data.sql before creating the first account.
- The first login can upload the current browser's existing DayQuest database after confirmation. Additional devices sign in with the same family email/password and load the cloud copy. JSON backups can also be imported from Settings > Data & backup.
- Local saves are queued for cloud sync. Offline changes remain on that device until it reconnects. Version checks detect concurrent edits and block silent stale overwrites; review the cloud sync bar to resolve conflicts.
- Read CLOUD_SETUP_README.md and DATA_MIGRATION_GUIDE.md before deploying or importing real financial records. If more than one old device has local records, export each backup and reconcile them before choosing the master cloud dataset.

PRIVACY / LIMITATIONS
- Authentication and data access are provided by Supabase, not by GitHub Pages. PostgreSQL Row Level Security restricts each account to its own family data row.
- The Supabase publishable key is public by design; database security depends on the included RLS migration and version-checked RPC. Supabase is transitioning from legacy anon/service_role keys to publishable/secret keys; use the publishable key for browser use. Never place a secret key in browser files.
- Browser localStorage keeps an offline copy. Clearing Chrome/site data can erase that local cache, so retain regular JSON backups even when cloud sync is enabled.
- Currency is shown as Bangladeshi taka (৳). Change the money() function in app.js if you
  prefer another currency.
- This is an installable offline web app (PWA), not a Play Store APK.


Saved expense editing
- Open the Expenses sidebar group → Add / manage expenses and tap Edit beside a saved expense.
- Change any field and tap Update expense.
- Tap Cancel edit to leave the saved entry unchanged.
- Editing updates the existing expense record instead of creating a duplicate.


Income and due collection
- Open Income and enter an income source, amount, payment type and date.
- Select Due when the customer/person has not paid yet, then enter their name.
- In the saved income list, tap Collect to record full or partial payment received later. Choose collection date and Cash or Bank.
- The outstanding due decreases automatically; once fully collected, the entry is marked Fully collected.
- Export a fresh backup after entering income records so they are included in your backup file.
- To settle an expense due, open Outstanding > Pay or collect an expense due, select a listed outstanding entry, and record the amount, payment date, method and note. Partial settlements are supported.


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


CLOUD FAMILY LOGIN
- Create one shared Family Account using the family's email address and password. Use the same credentials on every Android phone, tablet and computer that should share the family records.
- Email verification and password reset are handled by Supabase Auth. Configure the deployed DayQuest URL in Supabase Authentication > URL Configuration.
- Anyone with the shared family email/password can access and change the full family database. This build does not provide separate member-level permissions.
- If the browser is offline after a successful sign-in on that device, DayQuest can open the same user's cached local data. First sign-in and switching to a different Family Account require internet.
- If you forget the password, use Forgot password? on the login screen. Supabase sends a reset email; the old local device-only password is no longer used.
- When switching Family Accounts on one browser, DayQuest downloads a safety copy and will not automatically upload the previous account's local data into the new account.

INCOME TYPE AND INCOME BY PERSON
- Income Type describes where the money came from, such as Salary, Business, Sales, Freelance, Rent, Gift or a custom type.
- Income By identifies the person who earned the money. Select an existing person or use Add person to register another earner. Your Profile name is offered as a default person.
- Older income records without an earner are kept as Unassigned; edit those records to attribute them to a person.
- In the Income tab, filter by Income Type, Income By person and date.
- In Reports, use Show person to view one person or everyone for the selected week/month. The report shows totals by person and a separate breakdown by Income Type.


PURCHASE BILLS, SUPPLIER CREDITORS AND PRODUCT PURCHASE REPORT
- Open the Expenses sidebar group > Purchase to enter a supplier bill and review recent bills.
- Each line stores product name, optional pack size/specification (for example 300 gram), quantity, unit, rate per unit and line amount.
- Enter how much was paid immediately by Cash and by Bank. The remaining amount is calculated automatically as Credit / payable to supplier. Cash and Bank portions reduce those balances on the bill date; credit is shown as a supplier liability and reduces the selected balance only when a later supplier payment is recorded.
- Saving a bill creates/updates the supplier account. Open a supplier such as Rahman Store to see bill dates, bill totals, individual products, quantities, units, rates, line amounts, cash/bank/credit split, remaining credit and payment history.
- Use Pay supplier due in the supplier account for full or partial settlements. Choose the payment date, Cash or Bank amount, and any Discount Received. The payment amount reduces the selected cash/bank balance; the discount reduces the supplier creditor balance without changing cash/bank.
- Each purchase line creates a stock lot in Inventory. Stock can be assigned to one or more family members and consumed later; the app tracks purchased, sold, other-used and remaining quantities.
- Reports > Purchase Reports uses a From Date / To Date filter. Product type and individual product breakdowns show quantities, landed purchase costs, average rates and bill/line counts in the selected inclusive date range.
- Product purchase costs are already included in purchase bill spending. Recording a bill deducts the actual Cash/Bank paid portion once; supplier credit reduces Cash/Bank only when paid later.
- Existing old consumption entries in backups are retained for compatibility, but are no longer needed, displayed or used in product purchase reports.
- All purchase bills and supplier payments are included in JSON backups and synced to the shared Family Account when cloud sync is configured and online.

PRODUCT CATALOG
- In Expenses > Purchase, use the Add button beside Product Name to create or reuse a product and select it on that purchase line.
- When entering bill lines, click/type in Product name to see saved product suggestions. Choose a saved name or type a new one.
- Add another line adds a further product row to the current supplier bill.

SIDE MENU AND SETTINGS (2026-11-12)
- Main destinations are available from the left side menu: Overview, Expenses > Purchase, Inventory, Production, Supplier accounts / creditors, Outstanding > Pay or collect an expense due, Income, Daily quests, Reports, Profile and Settings.
- On a desktop browser, the side menu stays visible beside the app. On a phone/tablet, use the compact three-line hamburger button in the header to open the navigation drawer; selecting a destination closes it.
- Open Settings > Theme color to choose a custom brand color or one of the color presets. The selection is saved in the DayQuest local database and restored on the next visit.
- Open Settings > Purchase categories to add, rename or remove purchase categories. The default list is Assets, Staples and Fixed Ex.
- Select a Purchase category when saving a purchase bill. The selected category appears in the bill list, supplier bill details and Reports > By category totals.
- A category already used on a saved purchase bill cannot be deleted; rename it instead so old bills and reports keep their category history.
- Old purchase bills without a category are shown as Uncategorised and remain in reports. All existing financial records remain in the same local database; this update does not clear browser storage.

FAMILY PROFILE AND FAMILY-MEMBER INCOME ATTRIBUTION (2026-11-12)
- Open Profile to upload or remove a family/profile photo, set the family name, and manage the family member list.
- Uploaded photos are resized to a maximum 480-pixel edge and compressed as JPEG before being saved in DayQuest data, helping keep storage use smaller. Photos are included in the cloud family document and exported JSON backups.
- Add each person who can earn income under Profile > Family members. Every listed family member is automatically added to the Income By selector on the Income entry form and to the person filters/reports.
- The Profile full name is automatically added as a family member if it is not already listed.
- Removing a member from the family list does not rewrite or delete historical income entries. Existing income records keep the person recorded when they were created.
- Family name, member list and profile photo are stored in the DayQuest database document. With Supabase configured, they sync across devices with the shared Family Account.


LATEST NAVIGATION UPDATE (2026-11-14)
The top app bar no longer displays the DayQuest title. It now contains a compact three-line hamburger button for opening/hiding the side menu, plus the Install control when available. Desktop hide/show preference and mobile slide-out behavior are retained.

Product type-wise purchase reporting: open Reports and use the Purchase cost by product type section. The shared From Date / To Date filter applies to both the type summary and individual product breakdown.


LATEST UI UPDATE — INLINE PURCHASE CATALOG ADD BUTTONS
- Removed the Add New Product and Add Product Type buttons from the top of the Purchase page.
- Each purchase line now has a small Add button beside Product Name and another beside Product Type.
- Add beside Product Name creates or reuses a product and selects it on that specific purchase line.
- Add beside Product Type creates or reuses a product type and selects it on that specific purchase line.
- Existing product and product-type catalogs, purchase lines, inventory, reports, and saved bill data are unchanged.


Cost report member product consumption
Select a member in Reports > Cost > Member product consumption & cost list to see their stock consumption rows for the same From/To dates. Values use the assigned inventory lot's landed unit cost, with shared costs divided by the number of assigned members. The detail ledger is not added again to totals.


New Product and New Material shortcuts
- In Purchase, use New product above Recent purchase bills to add a product to the saved catalog and select it in a blank line of the current bill (or create a new line when needed).
- In Production, use New material above the Production register to add another inventory-material row to the production form.


REPORTS MENU AND UNITS (2026-11-14)
- All reports are grouped under the Reports expandable sidebar menu: Members Report, Production Report, Cost Report, Income Report, Creditors, Debtors, Assets, Purchase Reports and All Reports.
- The same From Date / To Date selection is shared by every report. All Reports displays every report pane together.
- Member costing, member product consumption and the guest stay/cost register are in Members Report. Production batches and produced quantities are in Production Report. Asset purchases are filtered from purchase bills whose category is Assets.
- Data & backup is under Settings, keeping the Reports area focused on financial and operational reports.
- Custom unit names can be added beside Purchase line Unit, Production Output Unit and Expense Unit. Production material and Sales Memo units follow the selected inventory lot so stock quantities cannot be converted accidentally.


SETTINGS & REPORTING UPDATES
- Settings now manages Supplier, Product, Product Type and Unit lists. Used values are protected from deletion; renaming updates linked records.
- Supplier requirement for due purchases is configurable in Settings.
- Purchase category is assigned per product line.
- All Reports opens as collapsed summaries with expandable details. Each report and All Reports can be printed / saved as PDF and exported as an Excel-compatible .xls file.

PURCHASE BILL ENTRY FORM
- Purchase entry uses a compact responsive layout: supplier, bill number and date share a header row on larger screens; product details and quantity/rate/amount fields are grouped to reduce scrolling.
- All fields and existing calculations remain available on mobile and desktop.


ALL FORMS COMPACT LAYOUT
- All transaction and setup forms use a compact responsive layout to reduce scrolling. Related fields are grouped where screen width allows. Login remains at its original comfortable size.

Inventory screen refinements (15 Nov 2026)
- Inventory cards show In stock, Unit cost and Cost owners in the collapsed summary.
- Additional quantities, source/date/bill details and assignment controls are in the expandable Other details section.
- Purchase-source inventory rows include an Edit recent bill action. The app's existing protections prevent editing bills whose stock has been consumed or whose supplier ledger has payment history.
- Inventory statement can be exported as Excel-compatible .xls or opened in the browser print dialog to save as PDF.
