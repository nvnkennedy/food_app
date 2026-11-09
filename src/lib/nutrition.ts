import type { Dish, Slot } from '../data/types'

export type Sex = 'male' | 'female'
export type Activity = 'sedentary' | 'light' | 'moderate' | 'active'
export type Kind = 'adult' | 'child'

export interface Profile {
  id: string
  kind: Kind
  name: string
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
  goalWeightKg: number
  activity: Activity
  /** diagnosed or suspected iron deficiency: dairy is kept away from iron-rich plates, high-iron dishes favoured */
  ironDeficient?: boolean
}

/** Daily targets. kcal/protein for fat loss (adults), the rest are reference intakes (DGE / NIH). */
export interface Targets {
  bmr: number
  tdee: number
  kcal: number
  protein_g: number
  fiber_g: number
  iron_mg: number
  zinc_mg: number
  magnesium_mg: number
  deficit: number
}

export type NutrientKey = 'kcal' | 'protein_g' | 'fiber_g' | 'iron_mg' | 'zinc_mg' | 'magnesium_mg'

export const NUTRIENTS: { key: NutrientKey; label: string; unit: string; short: string }[] = [
  { key: 'kcal', label: 'Calories', unit: 'kcal', short: 'kcal' },
  { key: 'protein_g', label: 'Protein', unit: 'g', short: 'P' },
  { key: 'fiber_g', label: 'Fibre', unit: 'g', short: 'Fib' },
  { key: 'iron_mg', label: 'Iron', unit: 'mg', short: 'Fe' },
  { key: 'zinc_mg', label: 'Zinc', unit: 'mg', short: 'Zn' },
  { key: 'magnesium_mg', label: 'Magnesium', unit: 'mg', short: 'Mg' }
]

export const ACTIVITY_FACTOR: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725
}

export const ACTIVITY_LABEL: Record<Activity, string> = {
  sedentary: 'Desk job, little exercise',
  light: 'Light: walks 1-3 days/week',
  moderate: 'Moderate: exercise 3-5 days/week',
  active: 'Active: hard exercise 6-7 days/week'
}

/** Mifflin-St Jeor. */
export function bmrOf(p: Profile): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age
  return p.sex === 'male' ? base + 5 : base - 161
}

/** Children: reference intakes by age band, no deficit. Growing kids eat to appetite. */
function childTargets(p: Profile): Targets {
  const a = p.age
  const band =
    a <= 3
      ? { kcal: 1100, protein_g: 13, fiber_g: 14, iron_mg: 7, zinc_mg: 3, magnesium_mg: 80 }
      : a <= 8
        ? { kcal: 1400, protein_g: 24, fiber_g: 17, iron_mg: 10, zinc_mg: 5, magnesium_mg: 130 }
        : a <= 13
          ? { kcal: 1800, protein_g: 34, fiber_g: 22, iron_mg: 8, zinc_mg: 8, magnesium_mg: 240 }
          : { kcal: 2200, protein_g: 52, fiber_g: 26, iron_mg: p.sex === 'female' ? 15 : 11, zinc_mg: p.sex === 'female' ? 9 : 11, magnesium_mg: p.sex === 'female' ? 360 : 410 }
  return { bmr: 0, tdee: band.kcal, deficit: 0, ...band }
}

export function targetsOf(p: Profile): Targets {
  if (p.kind === 'child') return childTargets(p)
  const bmr = bmrOf(p)
  const tdee = bmr * ACTIVITY_FACTOR[p.activity]
  // ~0.5 kg/week loss. Never below a safe floor.
  const floor = p.sex === 'male' ? 1500 : 1200
  const wanted = tdee - 500
  const kcal = Math.round(Math.max(floor, Math.min(wanted, tdee - 250)) / 10) * 10
  // Protein for fat loss while keeping muscle: ~1.6 g per kg of goal weight.
  const protein_g = Math.round(Math.max(60, p.goalWeightKg * 1.6))
  // Fibre: 14 g per 1000 kcal, at least 25 g (women) / 30 g (men).
  const fiber_g = Math.max(p.sex === 'male' ? 30 : 25, Math.round((kcal / 1000) * 14))
  // Iron: women before ~50 need much more. Zinc and magnesium: adult reference intakes.
  const iron_mg = p.sex === 'female' && p.age < 51 ? 18 : 8
  const zinc_mg = p.sex === 'male' ? 11 : 8
  const magnesium_mg = p.sex === 'male' ? (p.age >= 31 ? 420 : 400) : p.age >= 31 ? 320 : 310
  return { bmr: Math.round(bmr), tdee: Math.round(tdee), kcal, protein_g, fiber_g, iron_mg, zinc_mg, magnesium_mg, deficit: Math.round(tdee - kcal) }
}

/** Standard adult serving in this app corresponds to roughly this many kcal per day. */
export const STANDARD_DAY_KCAL = 1900

/** Average share of a standard adult serving this person eats (used for grocery scaling). */
export function dayFactor(p: Profile, t: Targets): number {
  if (p.kind === 'child') return p.age <= 3 ? 0.45 : p.age <= 8 ? 0.6 : p.age <= 13 ? 0.8 : 1
  return Math.round(Math.min(1.2, Math.max(0.65, t.kcal / STANDARD_DAY_KCAL)) * 20) / 20
}

/** Share of the day's calories per slot. */
export const SLOT_SHARE: Record<Slot, number> = {
  breakfast: 0.25,
  lunch: 0.35,
  dinner: 0.3,
  snack: 0.1
}

export const SLOT_ORDER: Slot[] = ['breakfast', 'snack', 'lunch', 'dinner']

export const SLOT_LABEL: Record<Slot, string> = {
  breakfast: 'Breakfast',
  snack: 'Snack',
  lunch: 'Lunch',
  dinner: 'Dinner'
}

/**
 * How much of a standard adult serving this person should take for this dish,
 * so that the slot lands near their calorie share. Clamped so plates stay realistic.
 */
export function portionFactor(dish: Dish, p: Profile, t: Targets, slot: Slot): number {
  if (p.kind === 'child') return dayFactor(p, t)
  const want = t.kcal * SLOT_SHARE[slot]
  const f = want / Math.max(1, dish.kcal)
  return Math.round(Math.min(1.4, Math.max(0.6, f)) * 20) / 20
}

export function portionLabel(f: number): string {
  if (f <= 0.65) return 'small plate'
  if (f <= 0.85) return 'slightly smaller plate'
  if (f <= 1.1) return 'normal plate'
  if (f <= 1.25) return 'slightly bigger plate'
  return 'big plate'
}

export function bmiOf(p: Profile): number {
  const h = p.heightCm / 100
  return p.weightKg / (h * h)
}

export function bmiBand(bmi: number): string {
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}

export function defaultProfile(id: string, name: string, sex: Sex, kind: Kind = 'adult', age?: number): Profile {
  if (kind === 'child') {
    const a = age ?? 6
    return { id, kind, name, sex, age: a, heightCm: Math.round(85 + a * 6), weightKg: Math.round(10 + a * 2.5), goalWeightKg: 0, activity: 'moderate' }
  }
  return {
    id,
    kind,
    name,
    sex,
    age: age ?? (sex === 'male' ? 36 : 33),
    heightCm: sex === 'male' ? 172 : 160,
    weightKg: sex === 'male' ? 88 : 75,
    goalWeightKg: sex === 'male' ? 74 : 60,
    activity: 'sedentary'
  }
}

/** Nutrients of a dish scaled by a portion factor. */
export function scaled(dish: Dish, f: number): Record<NutrientKey, number> {
  return {
    kcal: dish.kcal * f,
    protein_g: dish.protein_g * f,
    fiber_g: dish.fiber_g * f,
    iron_mg: dish.iron_mg * f,
    zinc_mg: dish.zinc_mg * f,
    magnesium_mg: dish.magnesium_mg * f
  }
}

export function fmtNutrient(key: NutrientKey, v: number): string {
  if (key === 'iron_mg' || key === 'zinc_mg') return (Math.round(v * 10) / 10).toFixed(1)
  return String(Math.round(v))
}
