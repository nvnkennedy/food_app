// One Dish = one complete plate for one meal slot.
// Example: "Sambar rice plate" = rice + sambar + poriyal + curd, not just sambar.
// Nutrition and ingredient quantities are PER ONE ADULT SERVING (a normal, not
// huge, portion). The app scales quantities per person from their calorie target.

export type Slot = 'breakfast' | 'lunch' | 'dinner' | 'snack'

/**
 * south = Tamil/Kerala/Andhra/Karnataka (the regional tag 'tamil' | 'kerala' | 'karnataka' | 'andhra' in `tags` says which;
 * no regional tag = tamil); north = rest of India; light = soups, salads, bowls, omelette-style dinners;
 * italian / german = simple everyday European home food for families who want it on some days.
 */
export type Cuisine = 'south' | 'north' | 'light' | 'italian' | 'german'

export type Protein = 'veg' | 'egg' | 'chicken' | 'fish' | 'prawn' | 'lamb'

export type Unit = 'g' | 'ml' | 'pc' | 'tsp' | 'tbsp' | 'cup' | 'bunch' | 'clove' | 'sprig' | 'pinch'

export interface Ingredient {
  /** Lower-case canonical name. Prefer a name from src/data/ingredients.ts so the grocery list can group it by store and show the German/Aldi name. */
  name: string
  /** Quantity for ONE adult serving. */
  qty: number
  unit: Unit
  /** Optional free text, e.g. "soaked overnight" or "Aldi: Hüttenkäse" */
  note?: string
}

/**
 * What one adult serving looks like on the plate, in countable or household measures.
 * The app multiplies qty by the person's portion factor and prints e.g. "2 idlis · 1 bowl (200 ml) sambar".
 * unit 'pc' = countable pieces (idli, dosa, chapati, egg); 'ml' = liquids/gravies (the app adds katori/bowl names);
 * 'g' = solids like cooked rice, poriyal, salad (the app adds cup equivalents for rice).
 */
export interface PortionItem {
  /** singular, lower-case: 'idli', 'dosa', 'chapati', 'rice (cooked)', 'sambar', 'chicken curry', 'poriyal', 'curd', 'salad', 'chutney' */
  item: string
  qty: number
  unit: 'pc' | 'ml' | 'g' | 'tbsp' | 'tsp'
}

export interface Dish {
  /** kebab-case, unique across all dish files, e.g. 'idly-sambar' */
  id: string
  /** Display name with the common/plain name where the Indian name is not self-explanatory, e.g. 'Poha (flattened rice) with peanuts' */
  name: string
  /** Optional Tamil / Hindi name in Latin script, e.g. 'Idli Sambar' */
  localName?: string
  /** One plain-English sentence for someone who has never heard of it: what it is, texture, taste. */
  description: string
  cuisine: Cuisine
  /** Which meal slots this plate suits. Many lunches also suit dinner. */
  slots: Slot[]
  protein: Protein
  /** Per adult serving */
  kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  /** Per adult serving, realistic estimates */
  iron_mg: number
  zinc_mg: number
  magnesium_mg: number
  /** What one adult serving is on the plate. */
  portion: PortionItem[]
  /** 1-2 sentences: how to get more protein/iron/zinc out of this plate (vitamin C pairing, dal+grain, soaking, fermenting, no tea/coffee with the meal). */
  absorption: string
  /** Active + cooking time in minutes */
  time_min: number
  /** easy = under ~30 min, no special skill; medium = 30-60 min or some marinating */
  effort: 'easy' | 'medium'
  /** true if a 6-year-old will eat it as-is or with chilli reduced. */
  kidFriendly: boolean
  /**
   * Descriptive tags used by the planner: 'high-protein', 'high-iron', 'high-fiber', 'leftover-friendly', 'one-pot', 'weekend',
   * 'quick', 'batch-cook', 'comfort', 'oven', 'steamed', 'everyday' (familiar home food, auto-planned), 'feast',
   * regional: 'tamil' | 'kerala' | 'karnataka' | 'andhra',
   * season: 'cold' (served cold/room temperature: curd rice, buttermilk, salads, overnight oats; avoided in winter),
   *         'warming' (hot soups, rasam, pongal, kanji; favoured in winter), 'cooling' (favoured in summer).
   */
  tags: string[]
  /** Per one adult serving */
  ingredients: Ingredient[]
  /** 5-8 short imperative steps, written for the whole family's pot (no quantities needed, the ingredient list has them). */
  steps: string[]
  /** One line of weight-loss or kid tip, e.g. 'Use 2 idlis per adult, fill up on sambar.' */
  tip?: string
}
