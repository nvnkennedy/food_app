import type { Dish, Protein, Slot } from '../data/types'
import { costOf, type Region } from '../data/prices'
import { PANTRY } from '../data/pantry'
import { rngFor } from './rng'
import { daysInMonth, isWeekend, toISO, fromISO, weekStart, type ISODate } from './dates'

export type Meals = Record<Slot, string> // dish id per slot
export interface DayPlan {
  date: ISODate
  meals: Meals
}

export interface PlanOptions {
  /** false = only familiar everyday dishes (tag 'everyday'); true = also offer occasional dishes on weekends */
  adventurous: boolean
  /** weekly grocery budget in the region's currency; 0 = no budget fitting */
  budget: number
  region: Region
  /** sum of the family's portion shares, e.g. 1 + 0.85 + 0.6 */
  familyFactor: number
  /** extra feast days chosen by the family (birthdays, festivals) */
  feastDays: ISODate[]
}
export const DEFAULT_PLAN_OPTIONS: PlanOptions = { adventurous: false, budget: 0, region: 'DE', familyFactor: 2.4, feastDays: [] }

const PLAN_VERSION = 'v5'
const MAIN_SLOTS: ('lunch' | 'dinner')[] = ['lunch', 'dinner']
const ALL_SLOTS: Slot[] = ['breakfast', 'snack', 'lunch', 'dinner']

/**
 * Weekdays are South Indian everyday home food. North Indian plates and light soups/salads/bowls
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
export const isEveryday = (d: Dish) => d.tags.includes('everyday')

/** The one regular feast lunch of the month: the second Sunday. */
export function feastDayOf(year: number, month0: number): ISODate {
  const n = daysInMonth(year, month0)
  let sundays = 0
  for (let i = 0; i < n; i++) {
    const d = new Date(year, month0, i + 1)
    if (d.getDay() === 0 && ++sundays === 2) return toISO(d)
  }
  return toISO(new Date(year, month0, n))
}

/** Estimated shopping cost of one dish for the whole family (pantry staples excluded). */
export function dishCost(d: Dish, region: Region, familyFactor: number): number {
  let c = 0
  for (const i of d.ingredients) if (!PANTRY.has(i.name)) c += costOf(region, i.name, i.qty * familyFactor, i.unit)
  return c
}

const cache = new Map<string, DayPlan[]>()

export function monthKey(year: number, month0: number): string {
  return `${year}-${String(month0 + 1).padStart(2, '0')}`
}

export function generateMonth(year: number, month0: number, dishes: Dish[], opts: PlanOptions = DEFAULT_PLAN_OPTIONS): DayPlan[] {
  const key = `${PLAN_VERSION}:${monthKey(year, month0)}:${dishes.length}:${opts.adventurous ? 'a' : 's'}:${opts.budget}:${opts.region}:${opts.familyFactor}:${opts.feastDays.join(',')}`
  const hit = cache.get(key)
  if (hit) return hit

  const rng = rngFor(`virundhu-${PLAN_VERSION}-${monthKey(year, month0)}`)
  const n = daysInMonth(year, month0)
  const dates: ISODate[] = Array.from({ length: n }, (_, i) => toISO(new Date(year, month0, i + 1)))
  const regularFeast = feastDayOf(year, month0)
  const feastSet = new Set<ISODate>([regularFeast, ...opts.feastDays.filter((d) => d.startsWith(monthKey(year, month0)))])

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
  const allowed = (d: Dish, weekend: boolean) => isEveryday(d) || (weekend && opts.adventurous)

  const pickDish = (dayIdx: number, slot: Slot, filter: (d: Dish) => boolean, weight: (d: Dish) => number, minGapDays: number): Dish | undefined => {
    const weekend = isWeekend(dates[dayIdx])
    let pool = dishes.filter((d) => d.slots.includes(slot) && !isFeast(d) && filter(d) && allowed(d, weekend))
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
      if (!isEveryday(d)) w *= 0.4 // occasional dishes stay occasional
      return w
    })
  }

  const mark = (dish: Dish, dayIdx: number) => {
    lastUsed.set(dish.id, dayIdx)
    usedCount.set(dish.id, (usedCount.get(dish.id) ?? 0) + 1)
  }

  const cuisineW = (dayIdx: number) => (d: Dish) => (isWeekend(dates[dayIdx]) ? WEEKEND_WEIGHT : WEEKDAY_WEIGHT)[d.cuisine] ?? 0

  const pickFeast = (date: ISODate, lambOk: boolean): Dish | undefined => {
    const feasts = dishes.filter((d) => isFeast(d) && d.slots.includes('lunch') && (lambOk ? d.protein === 'lamb' : d.protein !== 'lamb'))
    const pool = feasts.length ? feasts : dishes.filter((d) => isFeast(d) && d.slots.includes('lunch'))
    return pool.length ? rngFor(`feast-${date}`).pick(pool) : undefined
  }

  for (let i = 0; i < n; i++) {
    const cw = cuisineW(i)
    for (const slot of MAIN_SLOTS) {
      // Feast lunch: the regular monthly one (lamb in lamb months) and any day the family marked.
      if (slot === 'lunch' && feastSet.has(dates[i])) {
        const dish = pickFeast(dates[i], dates[i] === regularFeast && isLambMonth(month0))
        if (dish) {
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
    for (const slot of ALL_SLOTS) {
      if (!day.meals[slot] || !byId.has(day.meals[slot])) {
        const any = dishes.find((d) => d.slots.includes(slot) && !isFeast(d) && isEveryday(d)) ?? dishes.find((d) => d.slots.includes(slot))
        if (any) day.meals[slot] = any.id
      }
    }
  }

  // ---------- 3. Fit each calendar week into the budget ----------
  if (opts.budget > 0) fitBudget(plan, dishes, opts, feastSet)

  cache.set(key, plan)
  return plan
}

/**
 * Deterministically replace the most expensive meals of each week with cheaper familiar dishes
 * of the same kind until the week's estimated shopping cost is within the budget.
 * Feast lunches are kept. The week target is pro-rated when a week is cut by the month edge.
 */
function fitBudget(plan: DayPlan[], dishes: Dish[], opts: PlanOptions, feastSet: Set<ISODate>) {
  const byId = new Map(dishes.map((d) => [d.id, d]))
  const costMemo = new Map<string, number>()
  const cost = (d: Dish) => {
    let c = costMemo.get(d.id)
    if (c == null) {
      c = dishCost(d, opts.region, opts.familyFactor)
      costMemo.set(d.id, c)
    }
    return c
  }

  // group month days by calendar week (Monday start)
  const weeks = new Map<ISODate, DayPlan[]>()
  for (const day of plan) {
    const ws = weekStart(day.date)
    if (!weeks.has(ws)) weeks.set(ws, [])
    weeks.get(ws)!.push(day)
  }

  for (const [, days] of weeks) {
    const target = opts.budget * (days.length / 7)
    const used = () => new Set(days.flatMap((d) => Object.values(d.meals)))
    const total = () => days.reduce((s, d) => s + ALL_SLOTS.reduce((t, slot) => t + (byId.get(d.meals[slot]) ? cost(byId.get(d.meals[slot])!) : 0), 0), 0)

    const tried = new Set<string>()
    for (let iter = 0; iter < 40 && total() > target; iter++) {
      // most expensive replaceable meal (mains first, then breakfast/snack)
      let best: { day: DayPlan; slot: Slot; dish: Dish } | null = null
      for (const day of days) {
        for (const slot of ALL_SLOTS) {
          const dish = byId.get(day.meals[slot])
          if (!dish) continue
          if (slot === 'lunch' && feastSet.has(day.date)) continue
          const k = `${day.date}:${slot}`
          if (tried.has(k)) continue
          const mainBoost = slot === 'lunch' || slot === 'dinner' ? 1 : 0.6
          if (!best || cost(dish) * mainBoost > cost(best.dish) * (best.slot === 'lunch' || best.slot === 'dinner' ? 1 : 0.6)) best = { day, slot, dish }
        }
      }
      if (!best) break
      const { day, slot, dish } = best
      tried.add(`${day.date}:${slot}`)
      const weekend = isWeekend(day.date)
      const inUse = used()
      const base = dishes.filter((d) => d.slots.includes(slot) && !isFeast(d) && isEveryday(d) && !inUse.has(d.id) && (weekend || !d.tags.includes('weekend')) && (weekend || d.cuisine === 'south' || slot === 'breakfast' || slot === 'snack') && cost(d) < cost(dish) * 0.85)
      // same protein first, then egg, then veg: keeps the protein rhythm as long as the budget allows
      const tiers: ((d: Dish) => boolean)[] = [(d) => d.protein === dish.protein, (d) => d.protein === 'egg', (d) => d.protein === 'veg']
      let pick: Dish | undefined
      for (const tier of tiers) {
        const pool = base.filter(tier).sort((a, b) => cost(a) - cost(b) || a.name.localeCompare(b.name))
        if (pool.length) {
          // cheapest third, deterministic choice so both phones agree
          const third = pool.slice(0, Math.max(1, Math.ceil(pool.length / 3)))
          pick = rngFor(`budget-${day.date}-${slot}`).pick(third)
          break
        }
      }
      if (pick) day.meals[slot] = pick.id
    }
  }
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
    if (isEveryday(d)) s += 0.5
    return s
  }
  return pool.sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name))
}

/** Overrides the family made by swapping a meal: date -> slot -> dish id. */
export type Overrides = Record<ISODate, Partial<Meals>>

export function mealsFor(date: ISODate, dishes: Dish[], overrides: Overrides, opts: PlanOptions = DEFAULT_PLAN_OPTIONS): Meals {
  const [y, m] = date.split('-').map(Number)
  const month = generateMonth(y, m - 1, dishes, opts)
  const day = month.find((d) => d.date === date)
  const base: Meals = day ? { ...day.meals } : { breakfast: '', snack: '', lunch: '', dinner: '' }
  const ov = overrides[date]
  if (ov) for (const k of Object.keys(ov) as Slot[]) if (ov[k]) base[k] = ov[k] as string
  return base
}

/**
 * Replace disliked dishes with a deterministic familiar alternative of the same slot and protein.
 * Returns the slots that were replaced so the UI can mark them.
 */
export function applyDislikes(date: ISODate, meals: Meals, dishes: Dish[], disliked: Set<string>, overrides: Partial<Meals> = {}): { meals: Meals; replaced: Slot[] } {
  const out: Meals = { ...meals }
  const replaced: Slot[] = []
  const byId = new Map(dishes.map((d) => [d.id, d]))
  for (const slot of Object.keys(meals) as Slot[]) {
    const id = meals[slot]
    if (!disliked.has(id) || overrides[slot]) continue
    const cur = byId.get(id)
    const pool = dishes.filter((d) => d.slots.includes(slot) && !disliked.has(d.id) && !isFeast(d) && isEveryday(d) && (!cur || d.protein === cur.protein) && !Object.values(out).includes(d.id))
    const alt = pool.length ? rngFor(`dislike-${date}-${slot}`).pick(pool) : undefined
    if (alt) {
      out[slot] = alt.id
      replaced.push(slot)
    }
  }
  return { meals: out, replaced }
}

export function isRegularFeastDay(date: ISODate): boolean {
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

/** Estimated shopping cost for the given days (pantry excluded). */
export function daysCost(days: DayPlan[], byId: Map<string, Dish>, region: Region, familyFactor: number): number {
  let c = 0
  for (const day of days) for (const slot of ALL_SLOTS) {
    const d = byId.get(day.meals[slot])
    if (d) c += dishCost(d, region, familyFactor)
  }
  return c
}
