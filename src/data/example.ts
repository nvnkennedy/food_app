import type { Dish } from './types'

// Reference dish showing the expected level of detail. Not imported by the app.
export const EXAMPLE: Dish = {
  id: 'idly-sambar',
  name: 'Idly with sambar & coconut chutney',
  localName: 'Idli Sambar',
  cuisine: 'south',
  slots: ['breakfast', 'dinner'],
  protein: 'veg',
  kcal: 340,
  protein_g: 12,
  carbs_g: 58,
  fat_g: 6,
  fiber_g: 7,
  time_min: 25,
  effort: 'easy',
  kidFriendly: true,
  tags: ['steamed', 'batch-cook', 'quick', 'leftover-friendly'],
  ingredients: [
    { name: 'dosa batter', qty: 180, unit: 'ml', note: 'store-bought or home fermented' },
    { name: 'toor dal', qty: 30, unit: 'g' },
    { name: 'drumstick', qty: 1, unit: 'pc', note: 'or 50 g carrot/pumpkin' },
    { name: 'small onion', qty: 4, unit: 'pc' },
    { name: 'tomato', qty: 0.5, unit: 'pc' },
    { name: 'tamarind', qty: 1, unit: 'tsp' },
    { name: 'sambar powder', qty: 1.5, unit: 'tsp' },
    { name: 'turmeric', qty: 0.25, unit: 'tsp' },
    { name: 'mustard seeds', qty: 0.25, unit: 'tsp' },
    { name: 'curry leaves', qty: 1, unit: 'sprig' },
    { name: 'oil', qty: 1, unit: 'tsp' },
    { name: 'frozen grated coconut', qty: 25, unit: 'g' },
    { name: 'green chilli', qty: 0.5, unit: 'pc' },
    { name: 'salt', qty: 1, unit: 'pinch' }
  ],
  steps: [
    'Pressure cook toor dal with turmeric for 3 whistles and mash.',
    'Boil drumstick, small onions and tomato in tamarind water with sambar powder and salt until soft.',
    'Add the mashed dal, simmer 5 minutes, then temper with mustard seeds, curry leaves and dried chilli in oil.',
    'Grind coconut with green chilli, a little roasted chana dal and salt into chutney.',
    'Steam idlis in a greased idly plate for 10-12 minutes.',
    'Serve 3 idlis per adult with a big bowl of sambar; chutney on the side.'
  ],
  tip: 'Fill the bowl with sambar vegetables first; 3 idlis per adult, 2 for the little one.'
}
