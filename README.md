# Ghar Ka Khana

Family meal planner for an Indian family in Berlin: about 70% Indian food (mostly South Indian),
30% pasta, weight-loss friendly portions, a 6-year-old who eats the same food.

- **Today** – the day's breakfast, snack, lunch and dinner with per-person portion sizes, recipe and swap.
- **Plan** – the whole month. The plan is generated deterministically from the month, so every phone
  shows the same meals without an account. Swaps stay on the phone that made them.
- **Grocery** – weekly shopping list for the whole family, grouped into German supermarket, Indian store and pantry.
- **Me** – profiles for the two adults (Mifflin-St Jeor calorie target with a ~500 kcal deficit, protein target),
  weight log with chart.

## Develop

```bash
npm install
npm run dev          # http://localhost:5173, open from your phone on the same wifi
npx tsx scripts/check-plan.ts   # sanity check the dish database + planner
```

## Add or edit dishes

Dishes live in `src/data/dishes/*.ts` and follow the `Dish` type in `src/data/types.ts`.
Quantities and nutrition are per one adult serving. Reuse ingredient names from
`src/data/ingredients.ts` so the grocery list knows which store sells them.

## Deploy as a PWA (GitHub Pages)

Push to `main`/`master`. `.github/workflows/deploy.yml` builds and publishes `dist` to GitHub Pages.
In the repo settings → Pages, set *Source* to **GitHub Actions** once.
Open the Pages URL on the phone → *Add to Home screen*.

## Android APK

```bash
npm run build
npx cap sync android
cd android && gradlew.bat assembleDebug
```

APK: `android/app/build/outputs/apk/debug/app-debug.apk`. Copy to the phone and install
(allow "unknown sources" once). Needs Android Studio's SDK and its bundled JDK (`JAVA_HOME`).
