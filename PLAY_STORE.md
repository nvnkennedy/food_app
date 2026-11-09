# Publishing Virundhu on Google Play

## What is already prepared

- Package name: `com.virundhu.app` (final; it cannot change after the first upload).
- Release signing: `android/virundhu-release.jks` with credentials in `android/keystore.properties`.
  Both are git-ignored. **Back them up** (password manager + a copy off this PC). Losing the keystore
  means you can never update the app on Play again.
- `versionCode 2`, `versionName "1.0.0"` in `android/app/build.gradle`. Bump `versionCode` by 1 for every upload.
- Store graphics in `release/store/`: `icon-512.png` and `feature-1024x500.png`.
- Privacy policy page: https://nvnkennedy.github.io/food_app/privacy.html

## Build the release bundle (AAB)

```bash
npm run build
npx cap sync android
cd android && gradlew.bat bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab` (also copied to `release/virundhu-release.aab`).
Set `JAVA_HOME` to Android Studio's JDK (`C:\Program Files\Android\Android Studio\jbr`) if Gradle complains.

## Play Console steps (one time)

1. https://play.google.com/console → **Create app**. Name "Virundhu", default language English, App, Free.
2. **Set up your app** checklist in the dashboard:
   - Privacy policy: paste the URL above.
   - App access: "All functionality is available without special access".
   - Ads: No. Content rating: fill the questionnaire (Utility / no violence etc.) → Everyone.
   - Target audience: 18+ (the app is for parents; choosing "children" triggers Families policy requirements).
   - Data safety: "Does your app collect or share user data?" → **No**. All data stays on the device.
   - News app: No. COVID: No. Government app: No.
3. **Main store listing**: short description (80 chars), full description, 512 icon, 1024×500 feature graphic,
   at least 2 phone screenshots (take them from the installed app or the web app in Chrome device mode, 1080×1920 or similar).
4. **Testing → Internal testing** → Create release → upload the `.aab` → add your two Gmail addresses as testers → roll out.
   Install from the opt-in link on both phones and use it for a week.
5. **Production** → Create release → same `.aab` → Review and roll out. First review typically takes 1–7 days.

## Store listing text (draft)

**Short description**
South Indian family meal planner: daily plan, portions per person, protein and iron, budget.

**Full description**
Virundhu plans simple South Indian home food for the whole family: idli, dosa, upma, sambar rice, rasam,
kootu, poriyal, chicken and fish kuzhambu, egg curry, and more. Every day shows breakfast, snack, lunch and
dinner with each person's plate in real measures ("2 idlis, sambar 200 ml"), full nutrition (calories, protein,
fibre, iron, zinc, magnesium) against personal targets, how to absorb more from each plate, and the estimated cost.
Weekly grocery list that fits the budget you set, grouped by supermarket and Indian store with German names in
Germany or one list with rupee prices in India. One feast a month, your own feast days, favourites, "not for us",
eaten tracking, tonight-for-tomorrow prep reminders. No account, no ads, everything stays on your phone.

## Updating later

1. Change code, `npm run build`, `npx cap sync android`.
2. Increase `versionCode` (and `versionName`) in `android/app/build.gradle`.
3. `gradlew.bat bundleRelease`, upload the new `.aab` to Production → Create release.
The web version at GitHub Pages updates by itself on every push.
