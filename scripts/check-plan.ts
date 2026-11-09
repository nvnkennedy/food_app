// Sanity check for the dish database and planner. Run: npx tsx scripts/check-plan.ts
import { DISHES, DISH_BY_ID } from '../src/data'
import { INGREDIENT_STORE } from '../src/data/ingredients'
import { generateMonth, monthStats } from '../src/lib/planner'
import type { Slot } from '../src/data/types'

let problems = 0
const warn = (m: string) => {
  problems++
  console.log('  ! ' + m)
}

console.log(`Dishes: ${DISHES.length}`)
const bySlot: Record<Slot, number> = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 }
const byCuisine: Record<string, number> = {}
const byProtein: Record<string, number> = {}
const unknownIng = new Map<string, string[]>()
const ids = new Set<string>()

for (const d of DISHES) {
  if (ids.has(d.id)) warn(`duplicate id ${d.id}`)
  ids.add(d.id)
  for (const s of d.slots) bySlot[s]++
  byCuisine[d.cuisine] = (byCuisine[d.cuisine] ?? 0) + 1
  byProtein[d.protein] = (byProtein[d.protein] ?? 0) + 1
  if (d.kcal < 60 || d.kcal > 800) warn(`${d.id}: odd kcal ${d.kcal}`)
  if (d.steps.length < 3) warn(`${d.id}: only ${d.steps.length} steps`)
  if (d.ingredients.length < 3) warn(`${d.id}: only ${d.ingredients.length} ingredients`)
  if (!d.description || d.description.length < 30) warn(`${d.id}: weak description`)
  if (!d.portion || d.portion.length === 0) warn(`${d.id}: no portion`)
  if (!d.absorption || d.absorption.length < 30) warn(`${d.id}: weak absorption note`)
  if (!(d.iron_mg > 0) || !(d.zinc_mg > 0) || !(d.magnesium_mg > 0)) warn(`${d.id}: missing minerals`)
  const macroKcal = d.protein_g * 4 + d.carbs_g * 4 + d.fat_g * 9
  if (Math.abs(macroKcal - d.kcal) > d.kcal * 0.3) warn(`${d.id}: macros (${macroKcal} kcal) far from kcal ${d.kcal}`)
  for (const ing of d.ingredients) {
    const n = ing.name.toLowerCase()
    if (!(n in INGREDIENT_STORE)) {
      const list = unknownIng.get(n) ?? []
      list.push(d.id)
      unknownIng.set(n, list)
    }
  }
}

console.log('By slot:', bySlot)
console.log('By cuisine:', byCuisine)
console.log('By protein:', byProtein)

if (unknownIng.size) {
  console.log(`\nIngredients not in catalog (will default to German store): ${unknownIng.size}`)
  for (const [n, ds] of [...unknownIng.entries()].sort()) console.log(`  - ${n}  (${ds.length}: ${ds.slice(0, 3).join(', ')})`)
}

console.log('\nPlan check per month:')
for (let m = 0; m < 12; m++) {
  const plan = generateMonth(2026, m, DISHES)
  const stats = monthStats(plan, DISH_BY_ID)
  const seen = new Map<string, number>()
  let repeats = 0
  for (const day of plan) {
    for (const slot of ['lunch', 'dinner'] as const) {
      const id = day.meals[slot]
      const last = seen.get(id)
      if (last != null && plan.indexOf(day) - last < 7) repeats++
      seen.set(id, plan.indexOf(day))
    }
    for (const slot of ['breakfast', 'snack', 'lunch', 'dinner'] as Slot[]) {
      const d = DISH_BY_ID.get(day.meals[slot])
      if (!d) warn(`${day.date} ${slot}: missing dish`)
      else if (!d.slots.includes(slot)) warn(`${day.date} ${slot}: ${d.id} not a ${slot} dish`)
    }
  }
  const distinct = new Set(plan.flatMap((d) => Object.values(d.meals))).size
  console.log(
    `  ${2026}-${String(m + 1).padStart(2, '0')}: ` +
      Object.entries(stats.cuisines)
        .map(([k, v]) => `${k} ${v}`)
        .join('/') +
      '  ' +
      Object.entries(stats.proteins)
        .map(([k, v]) => `${k} ${v}`)
        .join(', ') +
      `  | distinct dishes ${distinct}, main repeats within 7 days: ${repeats}`
  )
}

console.log(problems ? `\n${problems} problem(s)` : '\nAll good')
process.exit(problems > 50 ? 1 : 0)
