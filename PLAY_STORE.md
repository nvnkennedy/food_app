# Publishing Platora (Virundhu) on Google Play — step by step for a first-time developer

Store name: **Platora**. Inside the app the planner is called **Virundhu**.

## 0. What you already have (nothing to build)

| What | Where |
|---|---|
| Signed release bundle to upload | `release/platora-release.aab` |
| Debug APK (for your own phones, not for Play) | `release/platora-debug.apk` |
| App icon 512×512 | `release/store/icon-512.png` |
| Feature graphic 1024×500 | `release/store/feature-1024x500.png` |
| Phone screenshots (6) | `release/store/screenshots/*.jpg` |
| Privacy policy URL | https://nvnkennedy.github.io/food_app/privacy.html |
| Package name (final, never changes) | `com.virundhu.app` |
| Signing key (BACK UP, never share) | `android/virundhu-release.jks` + `android/keystore.properties` |

Before anything else: copy `android/virundhu-release.jks` and `android/keystore.properties` to a password manager
and to a USB stick or cloud drive. If this key is lost, the app can never be updated on Play.

## 1. Open Play Console

https://play.google.com/console — sign in with the Google account that holds your developer account.

New personal developer accounts (created after Nov 2023) must finish **identity verification** in
*Settings → Developer account → Account details* before an app can be published. Have your ID ready.

## 2. Create the app

1. Click **Create app** (top right).
2. App name: `Platora`. Default language: English (United Kingdom). App or game: **App**. Free or paid: **Free**.
3. Tick both declarations (Developer Program Policies, US export laws). Click **Create app**.

You land on the app **Dashboard**. Everything below is a card on that dashboard; each one turns green when done.

## 3. "Set up your app" checklist (Dashboard → Set up your app → View tasks)

1. **Set privacy policy** → paste `https://nvnkennedy.github.io/food_app/privacy.html` → Save.
2. **App access** → "All functionality is available without special access" → Save.
3. **Ads** → "No, my app does not contain ads" → Save.
4. **Content rating** → Start questionnaire → email address → category **Utility, Productivity, Communication, or Other**
   → answer **No** to everything (no violence, no sexual content, no gambling, no user-generated content, no personal info sharing)
   → Save → Next → Submit. Rating comes back as "Everyone / PEGI 3".
5. **Target audience and content** → Target age: tick **18 and over** only (the app is for parents who cook) → Next → "No" for
   "could unintentionally appeal to children" → Save.
6. **News apps** → No. **COVID-19 contact tracing** → No. **Data safety**:
   - "Does your app collect or share any of the required user data types?" → **No**
   - "Is all of the user data collected by your app encrypted in transit?" → not asked when No
   - Save → Next → Submit. (All data stays on the phone; nothing is sent anywhere.)
7. **Government apps** → No. **Financial features** → None of these / No. **Health** → the app gives nutrition information;
   if asked, choose "My app does not have health features" is wrong — pick **"Health and fitness: nutrition / meal planning"**
   only if that option exists in your console; otherwise leave the Health declaration as "No".
8. **Advertising ID** → "No, my app does not use advertising ID".
9. **App category and contact details** → App; Category **Food & Drink**; contact email your Gmail; Save.
10. **Set up your store listing** → see step 4.

## 4. Main store listing (Grow → Store presence → Main store listing)

- **App name**: Platora
- **Short description** (max 80 characters):
  `Family meal planner for Indian home food: portions per person, nutrition, budget.`
- **Full description**: copy from the "Store listing text" section below.
- **App icon**: upload `release/store/icon-512.png`.
- **Feature graphic**: upload `release/store/feature-1024x500.png`.
- **Phone screenshots**: upload the six files in `release/store/screenshots/` (minimum 2, maximum 8).
- 7-inch and 10-inch tablet screenshots: optional, skip.
- Save.

## 5. Upload the app to Internal testing first

1. Left menu: **Test and release → Testing → Internal testing** → **Create new release**.
2. **App integrity**: click **Choose signing key → Use Google-generated key** when asked (Play App Signing).
   Google keeps a second key; your `virundhu-release.jks` becomes the *upload key*. This is the normal, recommended setup.
3. **App bundles** → **Upload** → pick `release/platora-release.aab`. Wait for the green tick.
4. Release name: leave the suggested `5 (1.1.1)`. Release notes: `First release.` → **Next** → **Save and publish** (or Review release → Start rollout).
5. **Testers** tab → **Create email list** → name "Family" → add your Gmail and your wife's Gmail → Save → tick the list → Save changes.
6. Copy the **"Copy link"** opt-in URL, open it on each phone, tap **Become a tester**, then **Download it on Google Play**.
   Within a few minutes the app installs from Play like any other app.

## 6. Going public (Production)

Personal accounts created after November 2023 must first run a **closed test**:
at least **12 testers** opted in for **14 continuous days**, then apply for production access
(Dashboard shows "Apply for production" when eligible; Google reviews the application within a few days).
Friends and relatives count; send them the opt-in link from **Closed testing** (same steps as internal testing,
track "Alpha"). Older accounts can go straight to Production.

Then: **Test and release → Production → Create new release** → add the same `.aab` (or "Add from library") → release notes →
**Next → Review → Start rollout to Production**. The first review usually takes 1–7 days; you get an email.
After approval the Play Store page is `https://play.google.com/store/apps/details?id=com.virundhu.app`.

## 7. Every later update

1. Change code → `npm run build` → `npx cap sync android`.
2. In `android/app/build.gradle` raise `versionCode` by 1 (and `versionName` as you like).
3. `cd android && gradlew.bat bundleRelease` (JAVA_HOME = `C:\Program Files\Android\Android Studio\jbr`).
4. Production → Create new release → upload the new `.aab` → Start rollout.
The web version at https://nvnkennedy.github.io/food_app/ updates itself on every git push.

## Store listing text

**Short description**
Family meal planner for Indian home food: portions per person, nutrition, budget.

**Full description**
Platora (Virundhu inside) plans simple South Indian home food for the whole family: idli, dosa, upma, sambar rice, rasam,
kootu, poriyal, chicken and fish kuzhambu, egg curry, and more. Every day shows breakfast, snack, lunch and
dinner with each person's plate in real measures ("2 idlis, sambar 200 ml"), full nutrition (calories, protein,
fibre, iron, zinc, magnesium) against personal targets, how to absorb more from each plate, and the estimated cost.
Weekly grocery list that fits the budget you set, grouped by supermarket and Indian store with German names in
Germany or one list with rupee prices in India. One feast a month, your own feast days, favourites, "not for us",
eaten tracking, tonight-for-tomorrow prep reminders. Choose your cuisines (Tamil, Kerala, Karnataka, Andhra, North Indian,
Italian, German), your diet (non-veg, pescatarian, eggetarian, vegetarian, vegan, Jain) and allergens to exclude;
the plan follows the season and keeps dairy away from iron-rich plates for iron-deficient members. Ingredient
substitutes for Indian towns and villages. No account, no ads, everything stays on your phone.

## If something is rejected

Google's email names the policy. The usual first-app issues: missing privacy policy link (step 3.1), wrong
target age (must be 18+ here), or a Data safety form that does not match (we collect nothing, so keep "No").
Fix in the console and click **Send for review** again; no new upload is needed for listing fixes.
