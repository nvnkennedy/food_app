import type { Dish, Slot } from '../data/types'

export const CUISINE_LABEL: Record<Dish['cuisine'], string> = {
  south: 'South Indian',
  north: 'North Indian',
  pasta: 'Pasta',
  light: 'Light'
}

export const PROTEIN_LABEL: Record<Dish['protein'], string> = {
  veg: 'Veg',
  egg: 'Egg',
  chicken: 'Chicken',
  fish: 'Fish',
  prawn: 'Prawn',
  lamb: 'Lamb'
}

/** A friendly illustration for a dish, used on cards. */
export function dishEmoji(dish: Dish, slot?: Slot): string {
  if (dish.cuisine === 'pasta') return '🍝'
  switch (dish.protein) {
    case 'chicken':
      return '🍗'
    case 'fish':
      return '🐟'
    case 'prawn':
      return '🦐'
    case 'lamb':
      return '🍖'
    case 'egg':
      return '🍳'
  }
  const n = dish.name.toLowerCase()
  if (slot === 'snack' || dish.slots.length === 1 && dish.slots[0] === 'snack') {
    if (n.includes('fruit') || n.includes('apple') || n.includes('banana')) return '🍎'
    if (n.includes('buttermilk') || n.includes('chaas') || n.includes('mor') || n.includes('malt')) return '🥛'
    return '🥗'
  }
  if (n.includes('idl')) return '🫓'
  if (n.includes('dosa') || n.includes('dosai') || n.includes('uttapam') || n.includes('pesarattu') || n.includes('adai') || n.includes('chilla')) return '🥞'
  if (n.includes('oats') || n.includes('porridge') || n.includes('daliya')) return '🥣'
  if (n.includes('paratha') || n.includes('roti') || n.includes('chapati') || n.includes('puttu')) return '🫓'
  if (n.includes('paneer')) return '🧀'
  if (n.includes('salad') || n.includes('sprout')) return '🥗'
  if (n.includes('soup') || n.includes('rasam') && !n.includes('rice')) return '🍲'
  if (n.includes('rice') || n.includes('biryani') || n.includes('khichdi') || n.includes('pongal') || n.includes('bath')) return '🍛'
  if (n.includes('upma') || n.includes('poha')) return '🍚'
  return '🥘'
}

export function DishChips({ dish, compact }: { dish: Dish; compact?: boolean }) {
  return (
    <div className="chips">
      <span className={`chip chip-${dish.protein}`}>{PROTEIN_LABEL[dish.protein]}</span>
      <span className={`chip${dish.cuisine === 'pasta' ? ' chip-pasta' : ''}`}>{CUISINE_LABEL[dish.cuisine]}</span>
      {!compact && dish.kidFriendly && <span className="chip">Kid friendly</span>}
    </div>
  )
}
