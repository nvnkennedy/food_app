import { useState } from 'react'
import type { Dish, Slot, Unit } from '../data/types'
import { Sheet } from './Sheet'
import { DishChips, dishEmoji } from './Chips'
import { IconClock, IconSwap } from './Icons'
import { useFamily, CHILD } from '../state'
import { portionLabel, SLOT_LABEL } from '../lib/nutrition'

function fmtIng(qty: number, unit: Unit): string {
  let q = qty
  if (unit === 'g' || unit === 'ml') q = q < 20 ? Math.round(q) : Math.round(q / 5) * 5
  else if (unit === 'pinch') return 'a pinch'
  else if (unit === 'sprig' || unit === 'clove' || unit === 'bunch') q = Math.max(1, Math.round(q))
  else q = Math.round(q * 2) / 2
  if (unit === 'g' && q >= 1000) return `${(q / 1000).toFixed(1).replace(/\.0$/, '')} kg`
  if (unit === 'ml' && q >= 1000) return `${(q / 1000).toFixed(1).replace(/\.0$/, '')} l`
  const s = Number.isInteger(q) ? String(q) : q.toFixed(2).replace(/\.?0+$/, '')
  return `${s} ${unit === 'pc' ? (q === 1 ? 'pc' : 'pcs') : unit}`
}

export function RecipeSheet({ dish, slot, onClose, onSwap }: { dish: Dish; slot: Slot; onClose: () => void; onSwap?: () => void }) {
  const { people, childEnabled, familyFactor, portionFor } = useFamily()
  const [perServing, setPerServing] = useState(false)
  const mult = perServing ? 1 : familyFactor

  return (
    <Sheet
      title={SLOT_LABEL[slot]}
      onClose={onClose}
      footer={
        onSwap && (
          <button className="btn secondary wide" onClick={onSwap}>
            <IconSwap size={16} /> Swap this meal
          </button>
        )
      }
    >
      <div className={`hero slot-${slot}`}>
        <div className="meal-ico" aria-hidden>
          {dishEmoji(dish, slot)}
        </div>
        <div className="grow">
          <h1 className="recipe-title">{dish.name}</h1>
          {dish.localName && <div className="muted small">{dish.localName}</div>}
        </div>
      </div>
      <div className="row-between">
        <DishChips dish={dish} />
        <span className="row small muted" style={{ gap: 4 }}>
          <IconClock size={14} /> {dish.time_min} min · {dish.effort}
        </span>
      </div>

      <div>
        <div className="nutri">
          <div>
            <b>{dish.kcal}</b>
            <span>kcal</span>
          </div>
          <div>
            <b>{dish.protein_g}g</b>
            <span>protein</span>
          </div>
          <div>
            <b>{dish.carbs_g}g</b>
            <span>carbs</span>
          </div>
          <div>
            <b>{dish.fat_g}g</b>
            <span>fat</span>
          </div>
          <div>
            <b>{dish.fiber_g}g</b>
            <span>fiber</span>
          </div>
        </div>
        <div className="faint xs" style={{ marginTop: 6, textAlign: 'center' }}>
          per one adult serving
        </div>
      </div>

      {(people.length > 0 || childEnabled) && (
        <section className="card">
          <div className="card-title">Who eats how much</div>
          <ul className="list">
            {people.map((p, i) => {
              const f = portionFor(dish, slot, p)
              return (
                <li key={p.profile.id} className="row">
                  <span className={'avatar' + (i === 1 ? ' a2' : '')}>{p.profile.name.slice(0, 1).toUpperCase()}</span>
                  <span className="grow">
                    <b>{p.profile.name}</b> · {f}× serving, {portionLabel(f)}
                  </span>
                  <span className="muted small" style={{ textAlign: 'right' }}>
                    {Math.round(dish.kcal * f)} kcal
                    <br />
                    {Math.round(dish.protein_g * f)} g protein
                  </span>
                </li>
              )
            })}
            {childEnabled && (
              <li className="row">
                <span className="avatar kid">K</span>
                <span className="grow">
                  <b>Little one</b> · about {CHILD.factor}× serving, less chilli
                </span>
                <span className="muted small">{Math.round(dish.kcal * CHILD.factor)} kcal</span>
              </li>
            )}
          </ul>
        </section>
      )}

      <section className="card">
        <div className="row-between">
          <div className="card-title" style={{ marginBottom: 0 }}>
            Ingredients
          </div>
          <div className="seg" style={{ padding: 3 }}>
            <button className={!perServing ? 'active' : ''} onClick={() => setPerServing(false)}>
              Family ×{familyFactor}
            </button>
            <button className={perServing ? 'active' : ''} onClick={() => setPerServing(true)}>
              1 serving
            </button>
          </div>
        </div>
        <ul className="list ingredients" style={{ marginTop: 8 }}>
          {dish.ingredients.map((ing, i) => (
            <li key={i}>
              <span className="ing-qty">{fmtIng(ing.qty * mult, ing.unit)}</span>
              <span className="ing-name">
                {ing.name}
                {ing.note && <em> · {ing.note}</em>}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <div className="card-title">Steps</div>
        <ol className="steps">
          {dish.steps.map((s, i) => (
            <li key={i}>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </section>

      {dish.tip && (
        <section className="tip">
          <b>Tip</b>
          <span>{dish.tip}</span>
        </section>
      )}
    </Sheet>
  )
}
