import type { Dish, Protein, Slot } from '../data/types'
import { rngFor } from './rng'
import { daysInMonth, isWeekend, toISO, fromISO, type ISODate } from './dates'

export type Meals = Record<Slot, string> // dish id per slot
export interface DayPlan {
  date: ISODate
  meals: Meals
}

const PLAN_VERSION = 'v3'
const MAIN_SLOTS: ('lunch' | 'dinner')[] = ['lunch', 'dinner']

/**
 * Weekdays are South Indian home food. North Indian plates and light soups/salads/bowls
 * are weekend extras only.
 */
const WEEKDAY_WEIGHT: Record<Dish['cuisine'], number> = { south: 1.0, north: 0, light: 0 }
const WEEKEND_WEIGHT: Record<Dish['cuisine'], number> = { south: 1.0, north: 0.45, light: 0.5 }

/** Weekly non-veg rhythm for 14 main slots (lunch + dinner x 7). */
const WEEK_PROTEINS: Protein[] = [
  'chicken', 'chicken', 'chicken',
  'fish', 'fish',
  'egg', 'egg', 'egg',
  'veg', 'veg', 'veg', 'veg', 'veg', 'veg'
]
/** Every second week one veg slot becomes prawn. */
const PRAWN_EVERY_N_WEEKS = 2
/** Lamb once every two months: in months with an even index (Jan, Mar, May, ...). The lamb meal is that month's feast. */
export function isLambMonth(month0: number): boolean {
  return month0 % 2 === 0
}

export const isFeast = (d: Dish) => d.tags.includes('feast')

/** The one feast lunch of the month: the second Sunday. */
export function feastDayOf(year: number, month0: number): ISODate {
  const n = daysInMonth(year, month0)
  let sundays = 0
  for (let i = 0; i < n; i++) {
    const d = new Date(year, month0, i + 1)
    if (d.getDay() === 0 && ++sundays === 2) return toISO(d)
  }
  return toISO(new Date(year, month0, n))
}

const cache = new Map<string, DayPlan[]>()

export function monthKey(year: number, month0: number): string {
  return `${year}-${String(month0 + 1).padStart(2, '0')}`
}

export function generateMonth(year: number, month0: number, dishes: Dish[]): DayPlan[] {
  const key = `${PLAN_VERSION}:${monthKey(year, month0)}:${dishes.length}`
  const hit = cache.get(key)
  if (hit) return hit

  const rng = rngFor(`virundhu-${PLAN_VERSION}-${monthKey(year, month0)}`)
  const n = daysInMonth(year, month0)
  const dates: ISODate[] = Array.from({ length: n }, (_, i) => toISO(new Date(year, month0, i + 1)))
  const feastDate = feastDayOf(year, month0)

  const byId = new Map(dishes.map((d) => [d.id, d]))
  const lastUsed = new Map<string, number>() // dish id -> day index
  const usedCount = new Map<string, number>()
  const plan: DayPlan[] = dates.map((date) => ({ date, meals: { breakfast: '', snack: '', lunch: '', dinner: '' } }))

  // ---------- 1. Decide the protein for every lunch/dinner ----------
  const specs: Record<number, Record<'lunch' | 'dinner', Protein>> = {}

  for (let chunk = 0, start = 0; start < n; chunk++, start += 7) {
    const len = Math.min(7, n - start)
    const slots = len * 2
    let proteins: Protein[] = rng.shuffle(WEEK_PROTEINS).slice(0, slots)
    if (chunk % PRAWN_EVERY_N_WEEKS === 1) {
      const vi = proteins.indexOf('veg')
      if (vi >= 0) proteins[vi] = 'prawn'
    }
    proteins = rng.shuffle(proteins)

    // avoid the same non-veg protein at lunch and dinner on one day
    for (let pass = 0; pass < 3; pass++) {
      for (let d = 0; d < len; d++) {
        const l = proteins[2 * d]
        const r = proteins[2 * d + 1]
        if (l === r && l !== 'veg') {
          for (let e = 0; e < len; e++) {
            if (e === d) continue
            const other = proteins[2 * e + 1]
            if (other !== l && proteins[2 * e] !== l) {
              proteins[2 * e + 1] = r
              proteins[2 * d + 1] = other
              break
            }
          }
        }
      }
    }

    let k = 0
    for (let d = 0; d < len; d++) {
      specs[start + d] = { lunch: proteins[k++], dinner: proteins[k++] }
    }
  }

  // ---------- 2. Pick dishes ----------
  const pickDish = (dayIdx: number, slot: Slot, filter: (d: Dish) => boolean, weight: (d: Dish) => number, minGapDays: number): Dish | undefined => {
    const weekend = isWeekend(dates[dayIdx])
    let pool = dishes.filter((d) => d.slots.includes(slot) && !isFeast(d) && filter(d))
    if (!weekend) pool = pool.filter((d) => !d.tags.includes('weekend')) // weekend specials stay on weekends
    const fresh = pool.filter((d) => {
      const last = lastUsed.get(d.id)
      return last == null || dayIdx - last >= minGapDays
    })
    const candidates = fresh.length ? fresh : pool
    if (!candidates.length) return undefined
    return rng.weighted(candidates, (d) => {
      let w = weight(d)
      w *= 1 / (1 + 2 * (usedCount.get(d.id) ?? 0)) // spread variety over the month
      if (!weekend && d.effort === 'medium') w *= 0.55
      if (weekend && d.tags.includes('weekend')) w *= 3
      if (!weekend && d.tags.includes('quick')) w *= 1.3
      if (d.tags.includes('high-iron')) w *= 1.25 // the family wants iron
      return w
    })
  }

  const mark = (dish: Dish, dayIdx: number) => {
    lastUsed.set(dish.id, dayIdx)
    usedCount.set(dish.id, (usedCount.get(dish.id) ?? 0) + 1)
  }

  const cuisineW = (dayIdx: number) => (d: Dish) => (isWeekend(dates[dayIdx]) ? WEEKEND_WEIGHT : WEEKDAY_WEIGHT)[d.cuisine] ?? 0

  for (let i = 0; i < n; i++) {
    const cw = cuisineW(i)
    for (const slot of MAIN_SLOTS) {
      // The monthly feast: one Sunday lunch, lamb in lamb months, biryani-style otherwise.
      if (slot === 'lunch' && dates[i] === feastDate) {
        const lamb = isLambMonth(month0)
        const feasts = dishes.filter((d) => isFeast(d) && d.slots.includes('lunch') && (lamb ? d.protein === 'lamb' : d.protein !== 'lamb'))
        const pool = feasts.length ? feasts : dishes.filter((d) => isFeast(d) && d.slots.includes('lunch'))
        if (pool.length) {
          const dish = rng.pick(pool)
          plan[i].meals.lunch = dish.id
          mark(dish, i)
          continue
        }
      }
      const want = specs[i][slot]
      const dish =
        pickDish(i, slot, (d) => d.protein === want, cw, 10) ??
        pickDish(i, slot, (d) => d.protein === 'veg' || d.protein === 'egg', cw, 10) ??
        pickDish(i, slot, (d) => d.cuisine === 'south', () => 1, 3)
      if (dish) {
        plan[i].meals[slot] = dish.id
        mark(dish, i)
      }
    }
    // Breakfast: South Indian tiffin on weekdays, about 2 egg breakfasts a week, never on a day that already has egg mains
    const eggDay = rng.next() < 2 / 7 && specs[i].lunch !== 'egg' && specs[i].dinner !== 'egg'
    const bf = pickDish(i, 'breakfast', (d) => (eggDay ? d.protein === 'egg' : d.protein !== 'egg'), (d) => Math.max(cw(d), d.protein === 'egg' ? 0.5 : 0), 6) ?? pickDish(i, 'breakfast', () => true, () => 1, 2)
    if (bf) {
      plan[i].meals.breakfast = bf.id
      mark(bf, i)
    }
    // Snack: South Indian snacks preferred, kid friendly
    const sn = pickDish(i, 'snack', () => true, (d) => (d.cuisine === 'south' ? 1 : 0.4) * (d.kidFriendly ? 1 : 0.5), 3) ?? pickDish(i, 'snack', () => true, () => 1, 0)
    if (sn) {
      plan[i].meals.snack = sn.id
      mark(sn, i)
    }
  }

  // Sanity: fill any empty slot with something valid so the UI never shows a hole.
  for (const day of plan) {
    for (const slot of ['breakfast', 'snack', 'lunch', 'dinner'] as Slot[]) {
      if (!day.meals[slot] || !byId.has(day.meals[slot])) {
        const any = dishes.find((d) => d.slots.includes(slot) && !isFeast(d))
        if (any) day.meals[slot] = any.id
      }
    }
  }

  cache.set(key, plan)
  return plan
}

/** Dishes that could replace `current` in this slot, most similar first. */
export function alternativesFor(current: Dish | undefined, slot: Slot, dishes: Dish[]): Dish[] {
  const pool = dishes.filter((d) => d.slots.includes(slot) && d.id !== current?.id)
  const score = (d: Dish) => {
    let s = 0
    if (current) {
      if (d.protein === current.protein) s += 2
      if (d.cuisine === current.cuisine) s += 1
    }
    if (d.cuisine === 'south') s += 0.5
    return s
  }
  return pool.sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name))
}

/** Overrides the family made by swapping a meal: date -> slot -> dish id. */
export type Overrides = Record<ISODate, Partial<Meals>>

export function mealsFor(date: ISODate, dishes: Dish[], overrides: Overrides): Meals {
  const [y, m] = date.split('-').map(Number)
  const month = generateMonth(y, m - 1, dishes)
  const day = month.find((d) => d.date === date)
  const base: Meals = day ? { ...day.meals } : { breakfast: '', snack: '', lunch: '', dinner: '' }
  const ov = overrides[date]
  if (ov) for (const k of Object.keys(ov) as Slot[]) if (ov[k]) base[k] = ov[k] as string
  return base
}

export function isFeastDay(date: ISODate): boolean {
  const d = fromISO(date)
  return feastDayOf(d.getFullYear(), d.getMonth()) === date
}

/** Summary counts for the month overview. */
export function monthStats(plan: DayPlan[], byId: Map<string, Dish>) {
  const proteins: Record<string, number> = {}
  const cuisines: Record<string, number> = {}
  let mains = 0
  for (const day of plan) {
    for (const slot of MAIN_SLOTS) {
      const d = byId.get(day.meals[slot])
      if (!d) continue
      mains++
      proteins[d.protein] = (proteins[d.protein] ?? 0) + 1
      cuisines[d.cuisine] = (cuisines[d.cuisine] ?? 0) + 1
    }
  }
  return { proteins, cuisines, mains }
}
