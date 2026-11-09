import type { Dish, Slot } from '../data/types'
import { SLOT_LABEL } from '../lib/nutrition'
import { describePortion } from '../lib/portion'
import { dishEmoji, CUISINE_LABEL, PROTEIN_LABEL } from './Chips'
import { IconClock, IconSwap } from './Icons'
import { useFamily, CHILD } from '../state'

export function MealCard({ slot, dish, swapped, onOpen, onSwap }: { slot: Slot; dish: Dish | undefined; swapped: boolean; onOpen: () => void; onSwap: () => void }) {
  const { people, childEnabled, portionFor } = useFamily()
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
        <div className="meal-sub">{dish.description}</div>
        <div className="meta">
          <span>
            <b>{dish.kcal}</b> kcal
          </span>
          <span className="sep" />
          <span>
            <b>{dish.protein_g}g</b> protein
          </span>
          <span className="sep" />
          <span>
            <b>{dish.fiber_g}g</b> fibre
          </span>
          <span className="sep" />
          <span>
            <b>{dish.iron_mg}mg</b> iron
          </span>
          <span className="sep" />
          <span className="row" style={{ gap: 4 }}>
            <IconClock size={13} /> {dish.time_min} min
          </span>
        </div>
        <div className="chips">
          <span className={`chip chip-${dish.protein}`}>{PROTEIN_LABEL[dish.protein]}</span>
          <span className="chip">{CUISINE_LABEL[dish.cuisine]}</span>
          {dish.tags.includes('high-iron') && <span className="chip chip-iron">High iron</span>}
        </div>
        {(people.length > 0 || childEnabled) && (
          <ul className="plates">
            {people.map((p, i) => {
              const f = portionFor(dish, slot, p)
              return (
                <li key={p.profile.id}>
                  <span className={'avatar' + (i === 1 ? ' a2' : '')}>{p.profile.name.slice(0, 1).toUpperCase()}</span>
                  <span>{describePortion(dish.portion, f)}</span>
                </li>
              )
            })}
            {childEnabled && (
              <li>
                <span className="avatar kid">K</span>
                <span>{describePortion(dish.portion, CHILD.factor)}</span>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
