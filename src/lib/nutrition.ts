import type { Dish, Slot } from '../data/types'

export type Sex = 'male' | 'female'
export type Activity = 'sedentary' | 'light' | 'moderate' | 'active'

export interface Profile {
  id: string
  name: string
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
  goalWeightKg: number
  activity: Activity
}

export interface Targets {
  bmr: number
  tdee: number
  kcal: number
  protein_g: number
  deficit: number
}

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

export function targetsOf(p: Profile): Targets {
  const bmr = bmrOf(p)
  const tdee = bmr * ACTIVITY_FACTOR[p.activity]
  // ~0.5 kg/week loss. Never below a safe floor.
  const floor = p.sex === 'male' ? 1500 : 1200
  const wanted = tdee - 500
  const kcal = Math.round(Math.max(floor, Math.min(wanted, tdee - 250)) / 10) * 10
  // Protein for fat loss while keeping muscle: ~1.6 g per kg of goal weight.
  const protein_g = Math.round(Math.max(60, p.goalWeightKg * 1.6))
  return { bmr: Math.round(bmr), tdee: Math.round(tdee), kcal, protein_g, deficit: Math.round(tdee - kcal) }
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

/** A 6-year-old's rough needs: ~1400 kcal, eats about 0.6 of an adult plate. */
export const CHILD_KCAL = 1400
export const CHILD_FACTOR = 0.6

/**
 * How much of a standard adult serving this person should take for this dish,
 * so that the slot lands near their calorie share. Clamped so plates stay realistic.
 */
export function portionFactor(dish: Dish, dailyKcal: number, slot: Slot): number {
  const want = dailyKcal * SLOT_SHARE[slot]
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

export function defaultProfile(id: string, name: string, sex: Sex): Profile {
  return {
    id,
    name,
    sex,
    age: sex === 'male' ? 36 : 33,
    heightCm: sex === 'male' ? 172 : 160,
    weightKg: sex === 'male' ? 88 : 75,
    goalWeightKg: sex === 'male' ? 74 : 60,
    activity: 'sedentary'
  }
}
