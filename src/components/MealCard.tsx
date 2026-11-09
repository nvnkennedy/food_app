import type { Dish, Slot } from '../data/types'
import { SLOT_LABEL } from '../lib/nutrition'
import { describePortion } from '../lib/portion'
import { dishEmoji, CUISINE_LABEL, PROTEIN_LABEL } from './Chips'
import { NutriStrip } from './NutriStrip'
import { IconCheck, IconClock, IconSwap } from './Icons'
import { useFamily } from '../state'
import { isFeast, isEveryday } from '../lib/planner'

export function MealCard({
  slot,
  dish,
  swapped,
  replaced,
  eaten,
  onToggleEaten,
  onOpen,
  onSwap
}: {
  slot: Slot
  dish: Dish | undefined
  swapped: boolean
  replaced?: boolean
  eaten?: boolean
  onToggleEaten?: () => void
  onOpen: () => void
  onSwap: () => void
}) {
  const { people, portionFor, prefs } = useFamily()
  if (!dish) return null
  const feast = isFeast(dish)
  const liked = prefs[dish.id] === 'like'
  return (
    <div className={`meal slot-${slot}${feast ? ' feast' : ''}${eaten ? ' eaten' : ''}`} onClick={onOpen} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onOpen()}>
      <div className="meal-ico" aria-hidden>
        {dishEmoji(dish, slot)}
      </div>
      <div className="meal-body">
        <div className="row-between">
          <div className="slot-tag">
            {SLOT_LABEL[slot]}
            {feast && <span className="feast-tag">Feast</span>}
            {swapped && <span className="swapped-tag">swapped</span>}
            {replaced && <span className="swapped-tag">replaced</span>}
            {liked && <span className="like-tag">♥</span>}
          </div>
          <div className="row" style={{ gap: 4 }}>
            {onToggleEaten && (
              <button
                className={'pill-btn' + (eaten ? ' done' : '')}
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleEaten()
                }}
                aria-pressed={eaten}
                aria-label={eaten ? 'Eaten' : 'Mark as eaten'}
              >
                <IconCheck size={13} /> {eaten ? 'Eaten' : 'Ate it'}
              </button>
            )}
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
        </div>
        <h3 className="meal-name">{dish.name}</h3>
        {dish.localName && <div className="meal-local">{dish.localName}</div>}
        <div className="meal-sub">{dish.description}</div>
        <NutriStrip values={{ kcal: dish.kcal, protein_g: dish.protein_g, fiber_g: dish.fiber_g, iron_mg: dish.iron_mg, zinc_mg: dish.zinc_mg, magnesium_mg: dish.magnesium_mg }} compact />
        <div className="chips">
          <span className={`chip chip-${dish.protein}`}>{PROTEIN_LABEL[dish.protein]}</span>
          <span className="chip">{CUISINE_LABEL[dish.cuisine]}</span>
          <span className="chip row" style={{ gap: 4 }}>
            <IconClock size={12} /> {dish.time_min} min
          </span>
          {!isEveryday(dish) && <span className="chip">Occasional</span>}
          {dish.tags.includes('high-iron') && <span className="chip chip-iron">High iron</span>}
          {dish.tags.includes('high-protein') && <span className="chip chip-protein">High protein</span>}
        </div>
        {people.length > 0 && (
          <ul className="plates">
            {people.map((p) => {
              const f = portionFor(dish, slot, p)
              return (
                <li key={p.profile.id}>
                  <span className={'avatar ' + p.cls}>{p.profile.name.slice(0, 1).toUpperCase()}</span>
                  <span>
                    <b>{p.profile.name}</b>: {describePortion(dish.portion, f)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
