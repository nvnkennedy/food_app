import type { Dish, Slot } from '../data/types'
import { SLOT_LABEL } from '../lib/nutrition'
import { dishEmoji, CUISINE_LABEL, PROTEIN_LABEL } from './Chips'
import { IconClock, IconSwap } from './Icons'
import { useFamily } from '../state'

export function MealCard({ slot, dish, swapped, onOpen, onSwap }: { slot: Slot; dish: Dish | undefined; swapped: boolean; onOpen: () => void; onSwap: () => void }) {
  const { people, portionFor } = useFamily()
  if (!dish) return null
  return (
    <div className={`meal slot-${slot}`} onClick={onOpen} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onOpen()}>
      <div className="meal-ico" aria-hidden>
        {dishEmoji(dish, slot)}
      </div>
      <div className="meal-body">
        <div className="row-between">
          <div className="slot-tag">
            {SLOT_LABEL[slot]}
            {swapped && <span className="swapped-tag">swapped</span>}
          </div>
          <button
            className="pill-btn"
            onClick={(e) => {
              e.stopPropagation()
              onSwap()
            }}
            aria-label={`Swap ${SLOT_LABEL[slot]}`}
          >
            <IconSwap size={14} /> Swap
          </button>
        </div>
        <h3 className="meal-name">{dish.name}</h3>
        {dish.localName && <div className="meal-sub">{dish.localName}</div>}
        <div className="meta">
          <span>
            <b>{dish.kcal}</b> kcal
          </span>
          <span className="sep" />
          <span>
            <b>{dish.protein_g} g</b> protein
          </span>
          <span className="sep" />
          <span className="row" style={{ gap: 4 }}>
            <IconClock size={13} /> {dish.time_min} min
          </span>
          <span className="sep" />
          <span>
            {PROTEIN_LABEL[dish.protein]} · {CUISINE_LABEL[dish.cuisine]}
          </span>
        </div>
        {people.length > 0 && (
          <div className="portions">
            {people.map((p, i) => {
              const f = portionFor(dish, slot, p)
              return (
                <span key={p.profile.id} className="avatar-chip">
                  <span className={'avatar' + (i === 1 ? ' a2' : '')}>{p.profile.name.slice(0, 1).toUpperCase()}</span>
                  {f}× · {Math.round(dish.kcal * f)} kcal
                </span>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
