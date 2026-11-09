# Platora · Virundhu

Store name Platora; the planner inside is called Virundhu.

Family meal planner for an Indian family: South Indian home food on weekdays, North Indian and light
plates as weekend extras, one feast a month, weight-loss friendly portions sized per person, and a
child who eats the same food. Every dish carries calories, protein, fibre, iron, zinc and magnesium,
a plain-English description, what one plate looks like in real measures, how to absorb more from it,
and an estimated cost. Works for Berlin (EUR, Aldi/Lidl + Indian store) and India (INR).

- **Welcome** – names of the adults and the child, country, weekly budget.
- **Today** – breakfast, snack, lunch and dinner with each person's plate ("Naveen: 3 idlis · sambar 250 ml (1 bowl)"),
  a nutrient panel per person against daily targets, recipe, absorption tips, cost and swap.
- **Plan** – the whole month, generated deterministically from the month so every phone shows the same meals
  without an account. Feast day marked. Swaps stay on the phone that made them.
- **Grocery** – weekly shopping list for the whole family with estimated cost against the weekly budget,
  grouped into supermarket / Indian store / pantry (Germany) or one list (India), with German / Aldi names in Germany.
- **Family** – profiles (Mifflin-St Jeor calorie target with a ~500 kcal deficit; protein, fibre, iron, zinc,
  magnesium targets; child targets by age), weight log, country, budget, theme.

## Plan rules

- Diet (non-veg, pescatarian, eggetarian, vegetarian, vegan, Jain) and allergen exclusions gate every dish (`src/lib/dietary.ts`).
- Cuisines are chosen by the family: Tamil, Kerala, Karnataka, Andhra, North Indian, Italian, German (regional tags on dishes).
- Season: winter excludes cold dishes and limits curd-based plates; summer favours cooling plates. Iron-deficient members keep dairy away from iron-rich plates.
- Ingredient substitutes for Indian towns and villages in `src/data/substitutes.ts`.

- Weekdays: South Indian only. Weekends: South Indian plus North Indian and light soups/salads as extras.
- One feast per month on the second Sunday (tag `feast`): biryani-style, lamb in every second month.
- Weekly protein rhythm: chicken 3×, fish 2×, egg 3×, rest veg; prawns every second week.
- Iron-rich dishes (tag `high-iron`) are favoured; no dish repeats within 10 days.

## Develop

```bash
npm install
npm run dev          # http://localhost:5173, open from your phone on the same wifi
npx tsx scripts/check-plan.ts   # sanity check the dish database + planner
```

## Add or edit dishes

Dishes live in `src/data/dishes/*.ts` and follow the `Dish` type in `src/data/types.ts`.
Quantities and nutrition are per one adult serving. Reuse ingredient names from
`src/data/ingredients.ts`; German / Aldi names in `src/data/germanNames.ts`; prices in `src/data/prices.ts`.

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
