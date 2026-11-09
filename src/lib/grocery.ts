import type { Dish, Unit } from '../data/types'
import { storeFor } from '../data/ingredients'
import type { Region } from '../data/prices'
import { PANTRY } from '../data/pantry'
import type { DayPlan } from './planner'

/** german/indian for Berlin; market for India (one shop); pantry everywhere. */
export type Group = 'german' | 'indian' | 'market' | 'pantry'

export interface GroceryLine {
  key: string
  name: string
  qty: number
  unit: Unit
  group: Group
  dishes: string[]
  note?: string
}

/** Preferred unit per ingredient so the same thing is not listed twice (e.g. curry leaves in pcs and sprigs). */
const CANON: Record<string, Unit> = {
  'curry leaves': 'sprig', 'coriander leaves': 'g', 'mint leaves': 'g', beetroot: 'g', cucumber: 'g', zucchini: 'g', curd: 'g',
  besan: 'g', peanuts: 'g', 'rolled oats': 'g', 'roasted chana dal': 'g', walnuts: 'g', 'chana dal': 'g', 'toor dal': 'g',
  'urad dal': 'g', 'rice flour': 'g', 'moong dal': 'g', ginger: 'tbsp', 'black pepper': 'tsp', 'chaat masala': 'tsp',
  'chilli flakes': 'tsp', 'red chilli powder': 'tsp', turmeric: 'tsp', cinnamon: 'pc', 'garam masala': 'tsp', 'cumin seeds': 'tsp',
  'pumpkin seeds': 'g', 'sesame seeds': 'g', almonds: 'g', cashews: 'g', dates: 'pc', 'greek yogurt': 'g'
}
const PIECE_G: Record<string, number> = { beetroot: 120, cucumber: 300, zucchini: 200, walnuts: 4, tomato: 100, onion: 100, potato: 120, carrot: 80, lemon: 60, almonds: 1.2, cashews: 1.5, dates: 8 }
const HERB_G: Partial<Record<Unit, number>> = { tbsp: 4, tsp: 1.5, sprig: 3, bunch: 50, pc: 2, g: 1 }

function convert(name: string, qty: number, from: Unit, to: Unit): number | null {
  if (from === to) return qty
  if (name === 'coriander leaves' || name === 'mint leaves') {
    const f = HERB_G[from]
    const t = HERB_G[to]
    return f && t ? (qty * f) / t : null
  }
  if (name === 'curry leaves' && from === 'pc' && to === 'sprig') return qty / 8
  if (to === 'g') {
    if (from === 'tsp') return qty * 4
    if (from === 'tbsp') return qty * 12
    if (from === 'pinch') return qty * 0.3
    if (from === 'pc' && PIECE_G[name]) return qty * PIECE_G[name]
    if (from === 'cup') return qty * 150
  }
  if (to === 'tsp') {
    if (from === 'pinch') return qty * 0.125
    if (from === 'tbsp') return qty * 3
  }
  if (to === 'tbsp') {
    if (from === 'tsp') return qty / 3
    if (from === 'pinch') return qty * 0.04
  }
  if (to === 'pc' && from === 'pinch') return qty * 0.1
  if (to === 'pc' && from === 'g' && PIECE_G[name]) return qty / PIECE_G[name]
  return null
}

export function groupFor(name: string, region: Region): Group {
  const n = name.toLowerCase()
  if (PANTRY.has(n)) return 'pantry'
  if (region === 'IN') return 'market'
  return storeFor(n)
}

function roundQty(qty: number, unit: Unit): number {
  switch (unit) {
    case 'g':
    case 'ml':
      return qty < 50 ? Math.ceil(qty / 5) * 5 : Math.ceil(qty / 10) * 10
    case 'pc':
    case 'tsp':
    case 'tbsp':
      return Math.ceil(qty * 2) / 2
    case 'cup':
      return Math.ceil(qty * 4) / 4
    case 'bunch':
    case 'sprig':
    case 'clove':
      return Math.ceil(qty)
    case 'pinch':
      return 1
  }
}

/**
 * Aggregate all ingredients for the given days.
 * familyFactor = sum of each person's portion share (e.g. 1.0 + 0.9 + 0.6 = 2.5 adult servings).
 */
export function groceryFor(days: DayPlan[], byId: Map<string, Dish>, familyFactor: number, region: Region): Record<Group, GroceryLine[]> {
  const acc = new Map<string, GroceryLine>()
  for (const day of days) {
    for (const id of Object.values(day.meals)) {
      const dish = byId.get(id)
      if (!dish) continue
      for (const ing of dish.ingredients) {
        const name = ing.name.toLowerCase().trim()
        let unit = ing.unit
        let qty = ing.qty
        const canon = CANON[name]
        if (canon && canon !== unit) {
          const c = convert(name, qty, unit, canon)
          if (c != null) {
            qty = c
            unit = canon
          }
        }
        const key = `${name}|${unit}`
        const line = acc.get(key) ?? { key, name, qty: 0, unit, group: groupFor(name, region), dishes: [] }
        line.qty += qty * familyFactor
        if (!line.dishes.includes(dish.name)) line.dishes.push(dish.name)
        acc.set(key, line)
      }
    }
  }
  const out: Record<Group, GroceryLine[]> = { german: [], indian: [], market: [], pantry: [] }
  for (const line of acc.values()) {
    if (line.name === 'water') continue
    line.qty = roundQty(line.qty, line.unit)
    out[line.group].push(line)
  }
  for (const g of Object.keys(out) as Group[]) out[g].sort((a, b) => a.name.localeCompare(b.name))
  return out
}

export function fmtQty(line: GroceryLine): string {
  const { qty, unit } = line
  if (unit === 'pinch') return 'a pinch'
  if (unit === 'g' && qty >= 1000) return `${(qty / 1000).toFixed(qty % 1000 === 0 ? 0 : 1)} kg`
  if (unit === 'ml' && qty >= 1000) return `${(qty / 1000).toFixed(qty % 1000 === 0 ? 0 : 1)} l`
  const q = Number.isInteger(qty) ? String(qty) : qty.toFixed(qty * 4 === Math.round(qty * 4) ? 2 : 1).replace(/\.?0+$/, '')
  const u = unit === 'pc' ? (qty === 1 ? 'pc' : 'pcs') : unit
  return `${q} ${u}`
}
