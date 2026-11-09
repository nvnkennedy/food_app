import type { Dish } from '../data/types'
import type { Region } from '../data/prices'

/* ---------- diets ---------- */

export type Diet = 'nonveg' | 'pescatarian' | 'eggetarian' | 'vegetarian' | 'vegan' | 'jain'

export const DIETS: { id: Diet; label: string; desc: string }[] = [
  { id: 'nonveg', label: 'Non-vegetarian', desc: 'Everything: chicken, fish, prawns, eggs, lamb, dal, vegetables' },
  { id: 'pescatarian', label: 'Pescatarian', desc: 'Fish, prawns and eggs, no chicken or lamb' },
  { id: 'eggetarian', label: 'Eggetarian', desc: 'Vegetarian plus eggs' },
  { id: 'vegetarian', label: 'Vegetarian', desc: 'No meat, fish or eggs; dairy is fine' },
  { id: 'vegan', label: 'Vegan', desc: 'No meat, fish, eggs, dairy, ghee or honey' },
  { id: 'jain', label: 'Jain', desc: 'Vegetarian, no onion, garlic or root vegetables' }
]

/* ---------- allergens ---------- */

export type Allergen = 'dairy' | 'egg' | 'nuts' | 'peanuts' | 'gluten' | 'soy' | 'fish' | 'shellfish' | 'sesame'

export const ALLERGENS: { id: Allergen; label: string; examples: string }[] = [
  { id: 'dairy', label: 'Dairy / lactose', examples: 'milk, curd, paneer, cheese, ghee, butter' },
  { id: 'egg', label: 'Egg', examples: 'eggs in any form' },
  { id: 'nuts', label: 'Tree nuts', examples: 'cashew, almond, walnut' },
  { id: 'peanuts', label: 'Peanuts', examples: 'peanuts, peanut butter' },
  { id: 'gluten', label: 'Gluten', examples: 'wheat, atta, rava, bread, pasta, vermicelli, broken wheat' },
  { id: 'soy', label: 'Soy', examples: 'soya chunks, tofu, soy sauce' },
  { id: 'fish', label: 'Fish', examples: 'any fish' },
  { id: 'shellfish', label: 'Shellfish', examples: 'prawns' },
  { id: 'sesame', label: 'Sesame', examples: 'sesame seeds, ellu podi' }
]

const ALLERGEN_MATCH: Record<Allergen, RegExp> = {
  dairy: /\b(milk|curd|yogurt|yoghurt|paneer|cheese|ghee|butter|cream|quark|skyr|mozzarella|feta|parmesan|buttermilk|khoya|malai)\b/,
  egg: /\beggs?\b/,
  nuts: /\b(cashews?|almonds?|walnuts?|pistachios?|hazelnuts?)\b/,
  peanuts: /\bpeanut/,
  gluten: /\b(atta|wheat|rava|semolina|bread|toast|pasta|spaghetti|penne|fusilli|lasagne|vermicelli|broken wheat|daliya|wraps?|oats|rolled oats|barley|maida)\b/,
  soy: /\b(soya?|tofu|soy sauce|edamame)\b/,
  fish: /\b(fish|salmon|cod|pangasius|tuna|mackerel|sardines?|tilapia|pomfret|king fish|seer fish|anchov)/,
  shellfish: /\b(prawns?|shrimp)\b/,
  sesame: /\bsesame\b/
}

export function dishAllergens(d: Dish): Set<Allergen> {
  const out = new Set<Allergen>()
  const names = d.ingredients.map((i) => i.name.toLowerCase())
  for (const a of ALLERGENS) if (names.some((n) => ALLERGEN_MATCH[a.id].test(n))) out.add(a.id)
  if (d.protein === 'egg') out.add('egg')
  if (d.protein === 'fish') out.add('fish')
  if (d.protein === 'prawn') out.add('shellfish')
  return out
}

export const hasDairy = (d: Dish) => dishAllergens(d).has('dairy')

/** Dishes where dairy is the main part of the plate (curd rice, mor kuzhambu, buttermilk drinks, raita-heavy). */
export function isDairyMain(d: Dish): boolean {
  const n = d.name.toLowerCase()
  if (/curd rice|mor kuzhambu|buttermilk|chaas|neer mor|kadhi|paneer|yogurt bowl|curd with|lassi/.test(n)) return true
  return d.ingredients.some((i) => /curd|yogurt|paneer|quark|cottage cheese/.test(i.name) && ((i.unit === 'g' && i.qty >= 100) || (i.unit === 'ml' && i.qty >= 100)))
}

const JAIN_FORBIDDEN = /\b(onion|small onion|spring onion|garlic|ginger garlic paste|potato|sweet potato|carrot|beetroot|radish|yam|ginger|mushrooms?|leek|drumstick|raw banana)\b/

export function dietAllows(d: Dish, diet: Diet): boolean {
  const p = d.protein
  const a = dishAllergens(d)
  switch (diet) {
    case 'nonveg':
      return true
    case 'pescatarian':
      return p !== 'chicken' && p !== 'lamb'
    case 'eggetarian':
      return p === 'veg' || p === 'egg'
    case 'vegetarian':
      return p === 'veg' && !a.has('egg')
    case 'vegan':
      return p === 'veg' && !a.has('egg') && !a.has('dairy') && !d.ingredients.some((i) => /honey/.test(i.name))
    case 'jain':
      return p === 'veg' && !a.has('egg') && !d.ingredients.some((i) => JAIN_FORBIDDEN.test(i.name.toLowerCase()))
  }
}

/* ---------- cuisines ---------- */

export type CuisineKey = 'tamil' | 'kerala' | 'karnataka' | 'andhra' | 'north' | 'italian' | 'german'

export const CUISINE_KEYS: { id: CuisineKey; label: string; group: 'south' | 'india' | 'europe' }[] = [
  { id: 'tamil', label: 'Tamil', group: 'south' },
  { id: 'kerala', label: 'Kerala', group: 'south' },
  { id: 'karnataka', label: 'Karnataka', group: 'south' },
  { id: 'andhra', label: 'Andhra', group: 'south' },
  { id: 'north', label: 'North Indian', group: 'india' },
  { id: 'italian', label: 'Italian', group: 'europe' },
  { id: 'german', label: 'German', group: 'europe' }
]

export const DEFAULT_CUISINES: CuisineKey[] = ['tamil', 'kerala', 'karnataka', 'andhra']

/** Which cuisine family a dish belongs to; 'light' plates are weekend extras rather than a cuisine. */
export function cuisineKeyOf(d: Dish): CuisineKey | 'light' {
  if (d.cuisine === 'south') {
    for (const k of ['tamil', 'kerala', 'karnataka', 'andhra'] as const) if (d.tags.includes(k)) return k
    return 'tamil'
  }
  return d.cuisine
}

export const CUISINE_KEY_LABEL: Record<CuisineKey | 'light', string> = {
  tamil: 'Tamil',
  kerala: 'Kerala',
  karnataka: 'Karnataka',
  andhra: 'Andhra',
  north: 'North Indian',
  italian: 'Italian',
  german: 'German',
  light: 'Light'
}

/* ---------- seasons ---------- */

export type Season = 'winter' | 'summer' | 'monsoon' | 'mild'

export function seasonOf(month0: number, region: Region): Season {
  if (region === 'IN') {
    if (month0 === 11 || month0 === 0) return 'winter'
    if (month0 >= 2 && month0 <= 5) return 'summer'
    if (month0 >= 6 && month0 <= 8) return 'monsoon'
    return 'mild'
  }
  if (month0 >= 10 || month0 <= 2) return 'winter'
  if (month0 >= 5 && month0 <= 7) return 'summer'
  return 'mild'
}

export const SEASON_LABEL: Record<Season, string> = { winter: 'Winter', summer: 'Summer', monsoon: 'Monsoon', mild: 'Mild season' }

const COLD_NAME = /curd rice|buttermilk|neer mor|chaas|salad|overnight oats|yogurt bowl|fruit bowl|sticks with|chaat|cold\b|raita bowl|lassi/
const WARM_NAME = /rasam|soup|pongal|kanji|koozh|porridge|kootu|khichdi|stew|dal soup|suppe|minestrone/

export const isCold = (d: Dish) => d.tags.includes('cold') || (!d.tags.includes('warming') && COLD_NAME.test(d.name.toLowerCase()))
export const isWarming = (d: Dish) => d.tags.includes('warming') || WARM_NAME.test(d.name.toLowerCase())
export const isCooling = (d: Dish) => d.tags.includes('cooling') || isCold(d)

/** Plain-language note for the Today screen. */
export function seasonNote(season: Season, region: Region): string {
  switch (season) {
    case 'winter':
      return region === 'IN' ? 'Winter: warm plates favoured, cold curd dishes kept to a minimum.' : 'Winter: no cold dishes; curd rice and buttermilk are rested, hot rasam, kootu and kanji are favoured.'
    case 'summer':
      return 'Summer: cooling plates like curd rice, buttermilk and lemon rice are favoured; heavy hot gravies less often.'
    case 'monsoon':
      return 'Monsoon: hot, freshly cooked plates favoured; raw salads kept to a minimum.'
    default:
      return ''
  }
}
