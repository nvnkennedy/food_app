import type { Dish, Slot } from '../data/types'
import { SLOT_LABEL } from '../lib/nutrition'
import { DishChips } from './Chips'
import { useFamily } from '../state'

export function MealCard({ slot, dish, swapped, onOpen, onSwap }: { slot: Slot; dish: Dish | undefined; swapped: boolean; onOpen: () => void; onSwap: () => void }) {
  const { people, portionFor } = useFamily()
  if (!dish) {
    return (
      <div className="card meal">
        <div className="meal-slot">{SLOT_LABEL[slot]}</div>
        <div className="muted">No dish available</div>
      </div>
    )
  }
  return (
    <div className="card meal" onClick={onOpen} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onOpen()}>
      <div className="meal-top">
        <div className="meal-slot">
          {SLOT_LABEL[slot]}
          {swapped && <span className="swapped">swapped</span>}
        </div>
        <button
          className="link-btn"
          onClick={(e) => {
            e.stopPropagation()
            onSwap()
          }}
        >
          Swap
        </button>
      </div>
      <h3 className="meal-name">{dish.name}</h3>
      {dish.localName && <div className="meal-local">{dish.localName}</div>}
      <DishChips dish={dish} />
      <div className="meal-nutri">
        <span>
          <b>{dish.kcal}</b> kcal
        </span>
        <span>
          <b>{dish.protein_g}</b> g protein
        </span>
        <span className="muted">per adult serving</span>
      </div>
      {people.length > 0 && (
        <div className="meal-portions">
          {people.map((p) => {
            const f = portionFor(dish, slot, p)
            return (
              <span key={p.profile.id} className="portion">
                {p.profile.name}: <b>{f}×</b> ≈ {Math.round(dish.kcal * f)} kcal
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
