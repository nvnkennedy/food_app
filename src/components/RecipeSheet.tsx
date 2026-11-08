import { useState } from 'react'
import type { Dish, Slot, Unit } from '../data/types'
import { Sheet } from './Sheet'
import { DishChips } from './Chips'
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
          <button className="btn btn-outline wide" onClick={onSwap}>
            Swap this meal
          </button>
        )
      }
    >
      <h1 className="recipe-title">{dish.name}</h1>
      {dish.localName && <div className="meal-local">{dish.localName}</div>}
      <DishChips dish={dish} />

      <div className="nutri-grid">
        <div>
          <b>{dish.kcal}</b>
          <span>kcal</span>
        </div>
        <div>
          <b>{dish.protein_g} g</b>
          <span>protein</span>
        </div>
        <div>
          <b>{dish.carbs_g} g</b>
          <span>carbs</span>
        </div>
        <div>
          <b>{dish.fat_g} g</b>
          <span>fat</span>
        </div>
        <div>
          <b>{dish.fiber_g} g</b>
          <span>fiber</span>
        </div>
      </div>
      <div className="muted small">per one adult serving</div>

      {(people.length > 0 || childEnabled) && (
        <section className="block">
          <h4>Who eats how much</h4>
          <ul className="plain">
            {people.map((p) => {
              const f = portionFor(dish, slot, p)
              return (
                <li key={p.profile.id}>
                  <b>{p.profile.name}</b>: {f}× serving, {portionLabel(f)} · ≈ {Math.round(dish.kcal * f)} kcal, {Math.round(dish.protein_g * f)} g protein
                </li>
              )
            })}
            {childEnabled && (
              <li>
                <b>Little one</b>: about {CHILD.factor}× serving, less chilli · ≈ {Math.round(dish.kcal * CHILD.factor)} kcal
              </li>
            )}
          </ul>
        </section>
      )}

      <section className="block">
        <div className="row-between">
          <h4>Ingredients</h4>
          <button className="link-btn" onClick={() => setPerServing((v) => !v)}>
            {perServing ? 'Show for family' : 'Show per 1 serving'}
          </button>
        </div>
        <div className="muted small">{perServing ? 'For one adult serving' : `For the whole family (${familyFactor}× adult servings)`}</div>
        <ul className="ingredients">
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

      <section className="block">
        <h4>Steps</h4>
        <ol className="steps">
          {dish.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </section>

      {dish.tip && (
        <section className="tip">
          <b>Tip</b> {dish.tip}
        </section>
      )}
    </Sheet>
  )
}
