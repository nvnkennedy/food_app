import type { Dish } from '../data/types'

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

export function DishChips({ dish, compact }: { dish: Dish; compact?: boolean }) {
  return (
    <div className="chips">
      <span className={`chip chip-${dish.protein}`}>{PROTEIN_LABEL[dish.protein]}</span>
      <span className={`chip chip-cuisine-${dish.cuisine}`}>{CUISINE_LABEL[dish.cuisine]}</span>
      {!compact && <span className="chip">⏱ {dish.time_min} min</span>}
      {!compact && dish.effort === 'easy' && <span className="chip chip-easy">Easy</span>}
      {!compact && dish.kidFriendly && <span className="chip chip-kid">Kid ok</span>}
    </div>
  )
}
