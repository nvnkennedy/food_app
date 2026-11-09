# Virundhu

Family meal planner for an Indian family in Berlin: mostly South Indian home food with North Indian
and light high-protein plates, weight-loss friendly portions, a 6-year-old who eats the same food.
Every dish carries calories, protein, fibre, iron, zinc and magnesium, a plain-English description,
what one plate looks like in real measures, and how to absorb more from it.

- **Today** – breakfast, snack, lunch and dinner with each person's plate ("2 idlis · sambar 200 ml (1 bowl)"),
  a nutrient panel per person (and the child) against daily targets, recipe, absorption tips and swap.
- **Plan** – the whole month. Generated deterministically from the month, so every phone shows the same
  meals without an account. Swaps stay on the phone that made them.
- **Grocery** – weekly shopping list for the whole family with German / Aldi names, grouped into
  supermarket, Indian store and pantry.
- **Me** – profiles for the two adults (Mifflin-St Jeor calorie target with a ~500 kcal deficit; protein,
  fibre, iron, zinc, magnesium targets), weight log with chart, theme.

## Develop

```bash
npm install
npm run dev          # http://localhost:5173, open from your phone on the same wifi
npx tsx scripts/check-plan.ts   # sanity check the dish database + planner
```

## Add or edit dishes

Dishes live in `src/data/dishes/*.ts` and follow the `Dish` type in `src/data/types.ts`.
Quantities and nutrition are per one adult serving. Reuse ingredient names from
`src/data/ingredients.ts`; German / Aldi names come from `src/data/germanNames.ts`.

## Deploy as a PWA (GitHub Pages)

Push to `main`. `.github/workflows/deploy.yml` builds and publishes `dist` to GitHub Pages
(repo settings → Pages → Source: GitHub Actions, once). Open the Pages URL on the phone → *Add to Home screen*.

## Android APK

```bash
npm run build
npx cap sync android
cd android && gradlew.bat assembleDebug
```

APK: `android/app/build/outputs/apk/debug/app-debug.apk`. Needs Android Studio's SDK and its bundled JDK
(`JAVA_HOME`), and `android/local.properties` with `sdk.dir` using forward slashes.
