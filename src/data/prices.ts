/**
 * Estimated grocery prices for the weekly shopping list, in two regions:
 *   DE = Berlin, Germany (EUR). Aldi / Lidl prices; Indian or Asian store for Indian items.
 *   IN = India, metro-city supermarket / market prices, 2025-26 (INR).
 * All figures are rough estimates and are shown to the user as "estimated".
 *
 * Price per base unit: per kg for things weighed (g), per litre for liquids (ml),
 * per piece for countable things, plus per bunch / sprig / clove for herbs and garlic.
 * An item may carry several of these; costOf() picks the one that matches the unit requested.
 */
import type { Unit } from './types'

export type Region = 'DE' | 'IN'

/** Price per base unit: per kg for things weighed (g), per litre for liquids (ml), per piece for countable things. */
export interface Price {
  perKg?: number
  perL?: number
  perPc?: number
  perBunch?: number
  perSprig?: number
  perClove?: number
}

export const PRICES: Record<Region, Record<string, Price>> = {
  // ------------------------------------------------------------------ Berlin, EUR
  DE: {
    // vegetables
    onion: { perKg: 1.3, perPc: 0.13 },
    'small onion': { perKg: 3, perPc: 0.08 },
    'spring onion': { perKg: 4, perPc: 0.15 },
    tomato: { perKg: 2.5, perPc: 0.25 },
    potato: { perKg: 1.2, perPc: 0.15 },
    'sweet potato': { perKg: 2.5, perPc: 0.6 },
    carrot: { perKg: 1.0, perPc: 0.1 },
    beetroot: { perKg: 2, perPc: 0.3 },
    cabbage: { perKg: 1, perPc: 1.2 },
    cauliflower: { perKg: 2.5, perPc: 1.8 },
    broccoli: { perKg: 3, perPc: 1.2 },
    'green beans': { perKg: 3 },
    spinach: { perKg: 2 },
    'frozen spinach': { perKg: 2 },
    'methi leaves': { perKg: 8, perBunch: 1.5 },
    zucchini: { perKg: 2.5, perPc: 0.5 },
    aubergine: { perKg: 2.5, perPc: 0.9 },
    'bell pepper': { perKg: 3.5, perPc: 0.6 },
    capsicum: { perKg: 3.5, perPc: 0.6 },
    cucumber: { perKg: 2, perPc: 0.6 },
    lettuce: { perKg: 3, perPc: 1.0 },
    rocket: { perKg: 10 },
    celery: { perKg: 2.5, perPc: 0.2 },
    pumpkin: { perKg: 2, perPc: 2.5 },
    'frozen peas': { perKg: 2 },
    'sweet corn': { perKg: 2.5 },
    'frozen mixed vegetables': { perKg: 2 },
    okra: { perKg: 7 },
    'bottle gourd': { perKg: 4, perPc: 2.5 },
    'ivy gourd': { perKg: 8 },
    drumstick: { perKg: 8, perPc: 0.5 },
    'raw banana': { perKg: 3, perPc: 0.6 },
    sprouts: { perKg: 6 },
    // fruit
    lemon: { perKg: 3, perPc: 0.4 },
    apple: { perKg: 2.5, perPc: 0.4 },
    banana: { perKg: 1.4, perPc: 0.2 },
    orange: { perKg: 2, perPc: 0.4 },
    berries: { perKg: 6 },
    pomegranate: { perKg: 4, perPc: 1.5 },
    dates: { perKg: 7, perPc: 0.06 },
    // eggs, meat, fish
    eggs: { perKg: 4.5, perPc: 0.25 },
    'chicken breast': { perKg: 9 },
    'chicken thigh': { perKg: 7 },
    'chicken drumstick': { perKg: 4.5, perPc: 0.5 },
    'chicken mince': { perKg: 7 },
    lamb: { perKg: 16 },
    salmon: { perKg: 20 },
    cod: { perKg: 14 },
    pangasius: { perKg: 9 },
    tilapia: { perKg: 10 },
    mackerel: { perKg: 8 },
    'king fish': { perKg: 18 },
    'frozen prawns': { perKg: 16 },
    // dairy
    milk: { perL: 1.0 },
    'low fat milk': { perL: 0.95 },
    curd: { perKg: 1.6 },
    'greek yogurt': { perKg: 3 },
    paneer: { perKg: 12 },
    cheese: { perKg: 9 },
    butter: { perKg: 8 },
    ghee: { perKg: 15 },
    tofu: { perKg: 6 },
    // pulses
    'toor dal': { perKg: 4 },
    'moong dal': { perKg: 4 },
    'whole moong': { perKg: 3.5 },
    'urad dal': { perKg: 4 },
    'chana dal': { perKg: 3.5 },
    'roasted chana dal': { perKg: 5 },
    'black chana': { perKg: 3.5 },
    'masoor dal': { perKg: 2.5 },
    'red lentils': { perKg: 2.5 },
    rajma: { perKg: 3 },
    chickpeas: { perKg: 2.5 },
    'canned chickpeas': { perKg: 2.5 },
    'horse gram': { perKg: 4 },
    'soya chunks': { perKg: 6 },
    // grains & flours
    'sona masoori rice': { perKg: 2.5 },
    'idly rice': { perKg: 2.5 },
    'red rice': { perKg: 3.5 },
    'brown rice': { perKg: 3 },
    millet: { perKg: 4 },
    quinoa: { perKg: 6 },
    'broken wheat': { perKg: 2.5 },
    atta: { perKg: 1.5 },
    besan: { perKg: 3 },
    rava: { perKg: 1.5 },
    poha: { perKg: 3 },
    'puffed rice': { perKg: 5 },
    'ragi flour': { perKg: 4 },
    'rice flour': { perKg: 2.5 },
    'puttu flour': { perKg: 4 },
    'appam flour': { perKg: 4 },
    vermicelli: { perKg: 3 },
    'rolled oats': { perKg: 1.5 },
    cornflour: { perKg: 2.5 },
    'dosa batter': { perL: 3 },
    'whole wheat bread': { perKg: 3, perPc: 0.15 },
    'tortilla wraps': { perKg: 4, perPc: 0.3 },
    makhana: { perKg: 25 },
    // nuts & seeds
    peanuts: { perKg: 5 },
    'peanut butter': { perKg: 7 },
    cashews: { perKg: 15, perPc: 0.025 },
    almonds: { perKg: 12, perPc: 0.015 },
    walnuts: { perKg: 12, perPc: 0.05 },
    'pumpkin seeds': { perKg: 9 },
    'sesame seeds': { perKg: 6 },
    'flax seeds': { perKg: 4 },
    'chia seeds': { perKg: 10 },
    'desiccated coconut': { perKg: 5 },
    'frozen grated coconut': { perKg: 5 },
    'coconut milk': { perL: 2.5 },
    // oils & fats
    oil: { perL: 2.5 },
    'olive oil': { perL: 8 },
    'coconut oil': { perL: 8 },
    // fresh aromatics & herbs
    ginger: { perKg: 5 },
    garlic: { perKg: 6, perPc: 0.5, perClove: 0.1 },
    'ginger garlic paste': { perKg: 6 },
    'green chilli': { perKg: 8, perPc: 0.1 },
    'curry leaves': { perKg: 30, perPc: 0.1, perSprig: 0.06, perBunch: 1.2 },
    'coriander leaves': { perKg: 12, perPc: 0.05, perSprig: 0.05, perBunch: 1.0 },
    'mint leaves': { perKg: 15, perPc: 0.01, perSprig: 0.05, perBunch: 1.0 },
    // spices (Indian store unless noted)
    turmeric: { perKg: 15 },
    'red chilli powder': { perKg: 15 },
    'kashmiri chilli powder': { perKg: 18 },
    'chilli flakes': { perKg: 20 },
    'paprika powder': { perKg: 15 },
    'coriander powder': { perKg: 15 },
    'cumin powder': { perKg: 15 },
    'cumin seeds': { perKg: 15 },
    'mustard seeds': { perKg: 8 },
    'fenugreek seeds': { perKg: 8 },
    'fennel seeds': { perKg: 12 },
    ajwain: { perKg: 20 },
    'black pepper': { perKg: 20 },
    cardamom: { perKg: 60, perPc: 0.03 },
    cloves: { perKg: 40, perPc: 0.01 },
    cinnamon: { perKg: 20, perPc: 0.05 },
    'bay leaf': { perKg: 30, perPc: 0.01 },
    'dried red chilli': { perKg: 15, perPc: 0.02 },
    asafoetida: { perKg: 60 },
    'kasuri methi': { perKg: 40 },
    amchur: { perKg: 20 },
    'black salt': { perKg: 5 },
    'garam masala': { perKg: 30 },
    'sambar powder': { perKg: 25 },
    'rasam powder': { perKg: 25 },
    'chicken masala': { perKg: 30 },
    'fish masala': { perKg: 30 },
    'biryani masala': { perKg: 30 },
    'chaat masala': { perKg: 25 },
    'pav bhaji masala': { perKg: 30 },
    'kitchen king masala': { perKg: 30 },
    'chettinad masala': { perKg: 35 },
    // pantry
    salt: { perKg: 0.5 },
    sugar: { perKg: 1.2 },
    jaggery: { perKg: 5 },
    honey: { perKg: 8 },
    tamarind: { perKg: 8 },
    'tomato paste': { perKg: 4 },
    'soy sauce': { perL: 5 },
    'vegetable stock': { perL: 0.5, perKg: 10 },
    'chicken stock': { perL: 0.6, perKg: 10 },
    eno: { perKg: 40 },
    papad: { perKg: 10, perPc: 0.15 },
    pickle: { perKg: 8 },
    water: { perL: 0, perKg: 0, perPc: 0 }
  },

  // ------------------------------------------------------------------ India, INR
  IN: {
    // vegetables
    onion: { perKg: 35, perPc: 3.5 },
    'small onion': { perKg: 80, perPc: 1.5 },
    'spring onion': { perKg: 80, perPc: 4 },
    tomato: { perKg: 40, perPc: 4 },
    potato: { perKg: 30, perPc: 3.5 },
    'sweet potato': { perKg: 50, perPc: 12 },
    carrot: { perKg: 60, perPc: 5 },
    beetroot: { perKg: 50, perPc: 6 },
    cabbage: { perKg: 30, perPc: 35 },
    cauliflower: { perKg: 40, perPc: 30 },
    broccoli: { perKg: 150, perPc: 60 },
    'green beans': { perKg: 80 },
    spinach: { perKg: 40 },
    'frozen spinach': { perKg: 40 },
    'methi leaves': { perKg: 60, perBunch: 15 },
    zucchini: { perKg: 100, perPc: 25 },
    aubergine: { perKg: 40, perPc: 10 },
    'bell pepper': { perKg: 120, perPc: 20 },
    capsicum: { perKg: 70, perPc: 12 },
    cucumber: { perKg: 40, perPc: 12 },
    lettuce: { perKg: 150, perPc: 50 },
    rocket: { perKg: 400 },
    celery: { perKg: 200, perPc: 10 },
    pumpkin: { perKg: 30, perPc: 60 },
    'frozen peas': { perKg: 120 },
    'sweet corn': { perKg: 80 },
    'frozen mixed vegetables': { perKg: 150 },
    okra: { perKg: 60 },
    'bottle gourd': { perKg: 35, perPc: 30 },
    'ivy gourd': { perKg: 60 },
    drumstick: { perKg: 80, perPc: 5 },
    'raw banana': { perKg: 50, perPc: 10 },
    sprouts: { perKg: 150 },
    // fruit
    lemon: { perKg: 100, perPc: 5 },
    apple: { perKg: 180, perPc: 25 },
    banana: { perKg: 60, perPc: 6 },
    orange: { perKg: 80, perPc: 15 },
    berries: { perKg: 800 },
    pomegranate: { perKg: 180, perPc: 45 },
    dates: { perKg: 300, perPc: 3 },
    // eggs, meat, fish
    eggs: { perKg: 130, perPc: 7 },
    'chicken breast': { perKg: 320 },
    'chicken thigh': { perKg: 260 },
    'chicken drumstick': { perKg: 260, perPc: 28 },
    'chicken mince': { perKg: 320 },
    lamb: { perKg: 800 },
    salmon: { perKg: 1800 },
    cod: { perKg: 1500 },
    pangasius: { perKg: 250 },
    tilapia: { perKg: 250 },
    mackerel: { perKg: 300 },
    'king fish': { perKg: 900 },
    'frozen prawns': { perKg: 500 },
    // dairy
    milk: { perL: 65 },
    'low fat milk': { perL: 55 },
    curd: { perKg: 70 },
    'greek yogurt': { perKg: 400 },
    paneer: { perKg: 400 },
    cheese: { perKg: 600 },
    butter: { perKg: 550 },
    ghee: { perKg: 600 },
    tofu: { perKg: 300 },
    // pulses
    'toor dal': { perKg: 160 },
    'moong dal': { perKg: 140 },
    'whole moong': { perKg: 120 },
    'urad dal': { perKg: 150 },
    'chana dal': { perKg: 110 },
    'roasted chana dal': { perKg: 140 },
    'black chana': { perKg: 120 },
    'masoor dal': { perKg: 120 },
    'red lentils': { perKg: 120 },
    rajma: { perKg: 160 },
    chickpeas: { perKg: 120 },
    'canned chickpeas': { perKg: 300 },
    'horse gram': { perKg: 120 },
    'soya chunks': { perKg: 200 },
    // grains & flours
    'sona masoori rice': { perKg: 60 },
    'idly rice': { perKg: 55 },
    'red rice': { perKg: 90 },
    'brown rice': { perKg: 90 },
    millet: { perKg: 100 },
    quinoa: { perKg: 500 },
    'broken wheat': { perKg: 70 },
    atta: { perKg: 50 },
    besan: { perKg: 110 },
    rava: { perKg: 55 },
    poha: { perKg: 70 },
    'puffed rice': { perKg: 80 },
    'ragi flour': { perKg: 80 },
    'rice flour': { perKg: 60 },
    'puttu flour': { perKg: 80 },
    'appam flour': { perKg: 90 },
    vermicelli: { perKg: 90 },
    'rolled oats': { perKg: 180 },
    cornflour: { perKg: 100 },
    'dosa batter': { perL: 80 },
    'whole wheat bread': { perKg: 150, perPc: 6 },
    'tortilla wraps': { perKg: 500, perPc: 25 },
    makhana: { perKg: 1000 },
    // nuts & seeds
    peanuts: { perKg: 150 },
    'peanut butter': { perKg: 450 },
    cashews: { perKg: 900, perPc: 1.5 },
    almonds: { perKg: 900, perPc: 1.1 },
    walnuts: { perKg: 1200, perPc: 4 },
    'pumpkin seeds': { perKg: 700 },
    'sesame seeds': { perKg: 250 },
    'flax seeds': { perKg: 200 },
    'chia seeds': { perKg: 600 },
    'desiccated coconut': { perKg: 350 },
    // fresh grated coconut: one coconut (~300 g) is about 40 INR -> 130/kg
    'frozen grated coconut': { perKg: 130, perPc: 40 },
    'coconut milk': { perL: 200 },
    // oils & fats
    oil: { perL: 160 },
    'olive oil': { perL: 900 },
    'coconut oil': { perL: 350 },
    // fresh aromatics & herbs
    ginger: { perKg: 120 },
    garlic: { perKg: 150, perPc: 8, perClove: 1 },
    'ginger garlic paste': { perKg: 250 },
    'green chilli': { perKg: 80, perPc: 1 },
    'curry leaves': { perKg: 100, perPc: 0.5, perSprig: 0.5, perBunch: 10 },
    'coriander leaves': { perKg: 100, perPc: 0.8, perSprig: 0.8, perBunch: 15 },
    'mint leaves': { perKg: 100, perPc: 0.2, perSprig: 0.8, perBunch: 15 },
    // spices
    turmeric: { perKg: 300 },
    'red chilli powder': { perKg: 350 },
    'kashmiri chilli powder': { perKg: 450 },
    'chilli flakes': { perKg: 600 },
    'paprika powder': { perKg: 600 },
    'coriander powder': { perKg: 300 },
    'cumin powder': { perKg: 500 },
    'cumin seeds': { perKg: 500 },
    'mustard seeds': { perKg: 150 },
    'fenugreek seeds': { perKg: 150 },
    'fennel seeds': { perKg: 300 },
    ajwain: { perKg: 400 },
    'black pepper': { perKg: 800 },
    cardamom: { perKg: 3000, perPc: 1.5 },
    cloves: { perKg: 1500, perPc: 0.4 },
    cinnamon: { perKg: 800, perPc: 2 },
    'bay leaf': { perKg: 400, perPc: 0.3 },
    'dried red chilli': { perKg: 350, perPc: 0.4 },
    asafoetida: { perKg: 2500 },
    'kasuri methi': { perKg: 800 },
    amchur: { perKg: 400 },
    'black salt': { perKg: 60 },
    'garam masala': { perKg: 800 },
    'sambar powder': { perKg: 500 },
    'rasam powder': { perKg: 500 },
    'chicken masala': { perKg: 700 },
    'fish masala': { perKg: 700 },
    'biryani masala': { perKg: 800 },
    'chaat masala': { perKg: 600 },
    'pav bhaji masala': { perKg: 600 },
    'kitchen king masala': { perKg: 700 },
    'chettinad masala': { perKg: 800 },
    // pantry
    salt: { perKg: 20 },
    sugar: { perKg: 45 },
    jaggery: { perKg: 80 },
    honey: { perKg: 500 },
    tamarind: { perKg: 200 },
    'tomato paste': { perKg: 400 },
    'soy sauce': { perL: 200 },
    'vegetable stock': { perL: 50, perKg: 1000 },
    'chicken stock': { perL: 60, perKg: 1200 },
    eno: { perKg: 800 },
    papad: { perKg: 300, perPc: 4 },
    pickle: { perKg: 250 },
    water: { perL: 0, perKg: 0, perPc: 0 }
  }
}

/** Fallbacks when an ingredient is missing. */
export const FALLBACK: Record<Region, Required<Price>> = {
  DE: { perKg: 5, perL: 3, perPc: 0.5, perBunch: 1.0, perSprig: 0.3, perClove: 0.1 },
  IN: { perKg: 150, perL: 120, perPc: 10, perBunch: 15, perSprig: 2, perClove: 1 }
}

export const CURRENCY: Record<Region, { code: string; symbol: string; locale: string }> = {
  DE: { code: 'EUR', symbol: '€', locale: 'de-DE' },
  IN: { code: 'INR', symbol: '₹', locale: 'en-IN' }
}

/** Approximate weight of one piece in grams, used to convert between g and pc. */
const PIECE_G: Record<string, number> = {
  tomato: 100,
  onion: 100,
  'small onion': 15,
  'spring onion': 15,
  potato: 120,
  'sweet potato': 250,
  carrot: 80,
  lemon: 60,
  eggs: 55,
  cucumber: 300,
  zucchini: 200,
  aubergine: 350,
  beetroot: 120,
  'bell pepper': 150,
  capsicum: 150,
  banana: 120,
  'raw banana': 200,
  apple: 150,
  orange: 200,
  pomegranate: 350,
  'green chilli': 5,
  'dried red chilli': 1,
  garlic: 50,
  drumstick: 60,
  celery: 50,
  cabbage: 1200,
  cauliflower: 700,
  broccoli: 400,
  lettuce: 350,
  pumpkin: 1200,
  'bottle gourd': 700,
  'chicken drumstick': 110,
  'whole wheat bread': 40,
  'tortilla wraps': 60,
  papad: 10,
  cashews: 1.5,
  almonds: 1.2,
  walnuts: 4,
  dates: 8,
  cardamom: 0.3,
  cloves: 0.1,
  cinnamon: 2,
  'bay leaf': 0.2,
  'curry leaves': 0.2,
  'mint leaves': 0.2,
  'coriander leaves': 1,
  'frozen grated coconut': 300
}
const DEFAULT_PIECE_G = 100
/** Garlic clove, coriander/mint sprig and bunch weights used when only a per-kg price exists. */
const CLOVE_G = 4
const SPRIG_G = 2
const BUNCH_G = 100
const SPRIGS_PER_BUNCH = 20

/** Grams (or ml) represented by one spoon / cup / pinch. */
const MEASURE_G: Partial<Record<Unit, number>> = { tsp: 5, tbsp: 15, cup: 200, pinch: 0.3 }

function pieceGrams(name: string): number {
  return PIECE_G[name] ?? DEFAULT_PIECE_G
}

/** Cost of a weight in grams, using perKg, then perL (1 ml ≈ 1 g), then perPc via piece weight, then the regional fallback. */
function costOfGrams(region: Region, name: string, grams: number, p: Price): number {
  if (p.perKg !== undefined) return (grams / 1000) * p.perKg
  if (p.perL !== undefined) return (grams / 1000) * p.perL
  if (p.perPc !== undefined) return (grams / pieceGrams(name)) * p.perPc
  if (p.perSprig !== undefined) return (grams / SPRIG_G) * p.perSprig
  if (p.perBunch !== undefined) return (grams / BUNCH_G) * p.perBunch
  if (p.perClove !== undefined) return (grams / CLOVE_G) * p.perClove
  return (grams / 1000) * FALLBACK[region].perKg
}

/** Cost of a volume in ml, using perL first, otherwise treating 1 ml ≈ 1 g. */
function costOfMl(region: Region, name: string, ml: number, p: Price): number {
  if (p.perL !== undefined) return (ml / 1000) * p.perL
  if (p.perKg !== undefined || p.perPc !== undefined) return costOfGrams(region, name, ml, p)
  return (ml / 1000) * FALLBACK[region].perL
}

/**
 * Cost of `qty` of `unit` of ingredient `name` in `region`.
 * Conversions: tsp = 5 g/ml, tbsp = 15 g/ml, cup = 200 g/ml, pinch = 0.3 g. For an item priced only perPc but
 * requested in g, assume PIECE_G (tomato 100, onion 100, potato 120, carrot 80, lemon 60, egg 55, cucumber 300,
 * zucchini 200, beetroot 120, bell pepper 150, banana 120, apple 150, green chilli 5, garlic clove 4, drumstick 60) or 100 g.
 */
export function costOf(region: Region, name: string, qty: number, unit: string): number {
  if (!Number.isFinite(qty) || qty <= 0) return 0
  const key = name.trim().toLowerCase()
  const p: Price = PRICES[region][key] ?? {}
  const fb = FALLBACK[region]
  const u = unit as Unit

  switch (u) {
    case 'g':
      return costOfGrams(region, key, qty, p)
    case 'ml':
      return costOfMl(region, key, qty, p)
    case 'tsp':
    case 'tbsp':
    case 'cup':
    case 'pinch': {
      const grams = qty * (MEASURE_G[u] ?? 1)
      // Liquids priced per litre: spoons and cups of them are volumes.
      if (p.perL !== undefined && p.perKg === undefined) return (grams / 1000) * p.perL
      return costOfGrams(region, key, grams, p)
    }
    case 'pc': {
      if (p.perPc !== undefined) return qty * p.perPc
      if (p.perKg !== undefined) return (qty * pieceGrams(key) / 1000) * p.perKg
      if (p.perSprig !== undefined) return qty * p.perSprig
      if (p.perL !== undefined) return (qty * pieceGrams(key) / 1000) * p.perL
      return qty * fb.perPc
    }
    case 'sprig': {
      if (p.perSprig !== undefined) return qty * p.perSprig
      if (p.perBunch !== undefined) return (qty / SPRIGS_PER_BUNCH) * p.perBunch
      if (p.perKg !== undefined) return (qty * SPRIG_G / 1000) * p.perKg
      return qty * fb.perSprig
    }
    case 'bunch': {
      if (p.perBunch !== undefined) return qty * p.perBunch
      if (p.perSprig !== undefined) return qty * SPRIGS_PER_BUNCH * p.perSprig
      if (p.perKg !== undefined) return (qty * BUNCH_G / 1000) * p.perKg
      return qty * fb.perBunch
    }
    case 'clove': {
      if (p.perClove !== undefined) return qty * p.perClove
      if (p.perKg !== undefined) return (qty * CLOVE_G / 1000) * p.perKg
      return qty * fb.perClove
    }
    default:
      // Unknown unit: treat the quantity as grams.
      return costOfGrams(region, key, qty, p)
  }
}

/** "€ 12,40" (de-DE) / "₹ 1,240" (en-IN) via Intl.NumberFormat; 2 decimals for EUR, none for INR. */
export function fmtMoney(region: Region, v: number): string {
  const { symbol, locale } = CURRENCY[region]
  const decimals = region === 'IN' ? 0 : 2
  const n = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(Number.isFinite(v) ? v : 0)
  return `${symbol} ${n}`
}
