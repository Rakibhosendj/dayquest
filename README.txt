DAYQUEST — OFFLINE EXPENSE & DAILY QUEST TRACKER

WHAT IT DOES
- Add, search, filter and delete daily expenses.
- Categories: Food, Transport, Shopping, Bills, Health, Education, Entertainment, Other.
- Create daily repeating quests or one-day quests; tick them off to track achievement.
- Overview with today's spending, weekly/monthly totals and today's quest progress.
- Weekly and monthly reports, daily spending bars, category breakdown and quest completion rate.
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
