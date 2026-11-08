import type { Dish } from './types'
import { SOUTH_VEG } from './dishes/southVeg'
import { NONVEG_AND_NORTH } from './dishes/nonVegAndNorth'
import { PASTA_LIGHT_NORTH_BF } from './dishes/pastaLightNorthBreakfast'

function dedupe(list: Dish[]): Dish[] {
  const seen = new Set<string>()
  const out: Dish[] = []
  for (const d of list) {
    if (seen.has(d.id)) {
      if (import.meta.env.DEV) console.warn(`Duplicate dish id dropped: ${d.id}`)
      continue
    }
    seen.add(d.id)
    out.push(d)
  }
  return out
}

export const DISHES: Dish[] = dedupe([...SOUTH_VEG, ...NONVEG_AND_NORTH, ...PASTA_LIGHT_NORTH_BF])

export const DISH_BY_ID: Map<string, Dish> = new Map(DISHES.map((d) => [d.id, d]))

export function dishById(id: string): Dish | undefined {
  return DISH_BY_ID.get(id)
}
