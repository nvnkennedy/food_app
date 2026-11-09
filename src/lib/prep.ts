import type { Dish } from '../data/types'

/** Things that need starting the evening before: soaking, sprouting, fermenting, marinating. */
const SOAK = new Set(['whole moong', 'black chana', 'rajma', 'chickpeas', 'horse gram', 'black eyed peas', 'idly rice', 'sago', 'peanuts'])
const SPROUTABLE = new Set(['whole moong', 'sprouts', 'horse gram', 'black chana', 'chickpeas'])

export interface PrepItem {
  dish: string
  text: string
}

/** What to do tonight so tomorrow's meals are easy. */
export function prepFor(dishes: Dish[]): PrepItem[] {
  const out: PrepItem[] = []
  const seen = new Set<string>()
  for (const d of dishes) {
    const n = d.name.toLowerCase()
    const push = (text: string) => {
      const k = d.id + text
      if (seen.has(k)) return
      seen.add(k)
      out.push({ dish: d.name, text })
    }
    for (const ing of d.ingredients) {
      const note = (ing.note ?? '').toLowerCase()
      if (/soak|overnight/.test(note)) push(`Soak ${ing.name} tonight`)
      else if ((/sprout/.test(note) || n.includes('sprout')) && SPROUTABLE.has(ing.name)) push(`Start sprouting ${ing.name === 'sprouts' ? 'whole moong' : ing.name} (2 days)`)
      else if (/marinat/.test(note)) push(`Marinate ${ing.name} tonight`)
      else if (SOAK.has(ing.name) && !/canned|tinned|roasted/.test(note) && ing.unit === 'g' && ing.qty >= 20) push(`Soak ${ing.name} tonight`)
    }
    if (/idli|idly|dosa|uttapam|paniyaram/.test(n) && d.ingredients.some((i) => i.name === 'dosa batter')) push('Check you have dosa/idli batter, or set it to ferment tonight')
    if (/adai|pesarattu/.test(n)) push('Soak the dals for the batter tonight')
    if (/kollu|horse gram/.test(n)) push('Soak horse gram (kollu) tonight')
    if (d.tags.includes('batch-cook')) push('Good one to cook double and keep for the next day')
  }
  return out
}
