import type { PortionItem } from '../data/types'

/** Household measures used in the app, so "250 ml" also reads as "1 bowl". */
export const MEASURES = [
  { name: 'tsp', ml: 5 },
  { name: 'tbsp', ml: 15 },
  { name: 'katori (small bowl)', ml: 150 },
  { name: 'bowl', ml: 250 },
  { name: 'big bowl', ml: 400 },
  { name: 'cup', ml: 200 }
]

function plural(item: string, n: number): string {
  if (n === 1) return item
  const base = item.split(' (')[0]
  const rest = item.slice(base.length)
  if (/(s|sh|ch|x)$/.test(base)) return base + 'es' + rest
  if (/[^aeiou]y$/.test(base)) return base.slice(0, -1) + 'ies' + rest
  return base + 's' + rest
}

function niceNumber(n: number): string {
  const r = Math.round(n * 2) / 2
  if (r === 0.5) return '½'
  if (Number.isInteger(r)) return String(r)
  return `${Math.floor(r)}½`
}

function bowlName(ml: number): string {
  if (ml <= 60) return `${Math.round(ml / 15)} tbsp`
  if (ml <= 110) return 'about ½ bowl'
  if (ml <= 190) return '1 katori (small bowl)'
  if (ml <= 300) return '1 bowl'
  if (ml <= 450) return '1 big bowl'
  return `${Math.round(ml / 250 * 2) / 2} bowls`
}

/** One portion item scaled by the person's factor, as a readable phrase. */
export function describeItem(p: PortionItem, factor: number): string {
  const q = p.qty * factor
  switch (p.unit) {
    case 'pc': {
      const n = Math.max(0.5, Math.round(q * 2) / 2)
      return `${niceNumber(n)} ${plural(p.item, n)}`
    }
    case 'ml': {
      const ml = Math.round(q / 10) * 10
      return `${p.item} ${ml} ml (${bowlName(ml)})`
    }
    case 'g': {
      const g = Math.round(q / 10) * 10
      const isRice = /rice|poha|upma|khichdi|pongal|biryani|bath|quinoa|millet/.test(p.item)
      const extra = isRice ? ` (${Math.round((g / 160) * 4) / 4} cup${g > 160 ? 's' : ''} cooked)` : g >= 100 ? ` (${bowlName(g)})` : ''
      return `${p.item} ${g} g${extra}`
    }
    case 'tbsp':
    case 'tsp': {
      const n = Math.max(0.5, Math.round(q * 2) / 2)
      return `${niceNumber(n)} ${p.unit} ${p.item}`
    }
  }
}

export function describePortion(items: PortionItem[], factor: number): string {
  return items.map((p) => describeItem(p, factor)).join(' · ')
}
