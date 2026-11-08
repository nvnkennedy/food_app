// One Dish = one complete plate for one meal slot.
// Example: "Sambar rice plate" = rice + sambar + poriyal + curd, not just sambar.
// Nutrition and ingredient quantities are PER ONE ADULT SERVING (a normal, not
// huge, portion). The app scales quantities per person from their calorie target.

export type Slot = 'breakfast' | 'lunch' | 'dinner' | 'snack'

/** south = Tamil/Kerala/Andhra/Karnataka; north = rest of India; pasta = Italian-style pasta; light = soups, salads, oats, omelette-style dinners */
export type Cuisine = 'south' | 'north' | 'pasta' | 'light'

export type Protein = 'veg' | 'egg' | 'chicken' | 'fish' | 'prawn' | 'lamb'

export type Unit = 'g' | 'ml' | 'pc' | 'tsp' | 'tbsp' | 'cup' | 'bunch' | 'clove' | 'sprig' | 'pinch'

export interface Ingredient {
  /** Lower-case canonical name. Prefer a name from src/data/ingredients.ts so the grocery list can group it by store. */
  name: string
  /** Quantity for ONE adult serving. */
  qty: number
  unit: Unit
  /** Optional free text, e.g. "soaked overnight" */
  note?: string
}

export interface Dish {
  /** kebab-case, unique across all dish files, e.g. 'idly-sambar' */
  id: string
  /** Display name, e.g. 'Idly with sambar & chutney' */
  name: string
  /** Optional Tamil / Hindi name in Latin script, e.g. 'Idli Sambar' */
  localName?: string
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
  /** Active + cooking time in minutes */
  time_min: number
  /** easy = under ~30 min, no special skill; medium = 30-60 min or some marinating */
  effort: 'easy' | 'medium'
  /** true if a 6-year-old will eat it as-is or with chilli reduced. */
  kidFriendly: boolean
  /** Descriptive tags used by the planner: e.g. 'high-protein', 'low-carb', 'leftover-friendly', 'one-pot', 'weekend', 'quick', 'batch-cook' */
  tags: string[]
  /** Per one adult serving */
  ingredients: Ingredient[]
  /** 5-8 short imperative steps, written for the whole family's pot (no quantities needed, the ingredient list has them). */
  steps: string[]
  /** One line of weight-loss or kid tip, e.g. 'Use 2 idlis per adult, fill up on sambar.' */
  tip?: string
}
