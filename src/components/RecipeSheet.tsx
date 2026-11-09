import { useState } from 'react'
import type { Dish, Slot, Unit } from '../data/types'
import { germanName } from '../data/germanNames'
import { costOf, fmtMoney } from '../data/prices'
import { Sheet } from './Sheet'
import { DishChips, dishEmoji } from './Chips'
import { IconClock, IconSwap } from './Icons'
import { useFamily } from '../state'
import { fmtNutrient, NUTRIENTS, scaled, SLOT_LABEL } from '../lib/nutrition'
import { describePortion, MEASURES } from '../lib/portion'
import { isFeast } from '../lib/planner'

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
  const { people, familyFactor, portionFor, settings } = useFamily()
  const [perServing, setPerServing] = useState(false)
  const mult = perServing ? 1 : familyFactor
  const region = settings.region
  const cost = dish.ingredients.reduce((s, i) => s + costOf(region, i.name, i.qty * mult, i.unit), 0)

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
      <p className="desc">{dish.description}</p>
      {isFeast(dish) && <div className="banner">🎉 This month's feast. Enjoy it, keep the portion honest, and the rest of the week stays light.</div>}
      <div className="row-between">
        <DishChips dish={dish} />
        <span className="row small muted" style={{ gap: 4, flex: 'none' }}>
          <IconClock size={14} /> {dish.time_min} min
        </span>
      </div>

      <section className="card">
        <div className="card-title">Nutrition · one adult serving</div>
        <div className="nutri">
          {NUTRIENTS.map((n) => (
            <div key={n.key}>
              <b>
                {fmtNutrient(n.key, dish[n.key])}
                <small>{n.key === 'kcal' ? '' : n.unit}</small>
              </b>
              <span>{n.label}</span>
            </div>
          ))}
          <div>
            <b>
              {dish.carbs_g}
              <small>g</small>
            </b>
            <span>Carbs</span>
          </div>
          <div>
            <b>
              {dish.fat_g}
              <small>g</small>
            </b>
            <span>Fat</span>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-title">Standard plate · one adult</div>
        <div className="plate-std">{describePortion(dish.portion, 1)}</div>
        {people.length > 0 && (
          <>
            <div className="card-title" style={{ marginTop: 14 }}>
              Your plates
            </div>
            <ul className="list">
              {people.map((p) => {
                const f = portionFor(dish, slot, p)
                const s = scaled(dish, f)
                return (
                  <li key={p.profile.id} className="eater">
                    <div className="row">
                      <span className={'avatar ' + p.cls}>{p.profile.name.slice(0, 1).toUpperCase()}</span>
                      <b>{p.profile.name}</b>
                      <span className="faint xs">· {f}× serving</span>
                    </div>
                    <div className="eater-plate">{describePortion(dish.portion, f)}</div>
                    <div className="eater-nutri">
                      {NUTRIENTS.map((n) => (
                        <span key={n.key}>
                          <b>{fmtNutrient(n.key, s[n.key])}</b>
                          {n.key === 'kcal' ? '' : n.unit} {n.short === 'kcal' ? '' : n.short}
                          <em>{Math.round((s[n.key] / p.targets[n.key]) * 100)}%</em>
                        </span>
                      ))}
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="faint xs">Percent = share of that person's daily target covered by this meal.</div>
          </>
        )}
      </section>

      <section className="tip">
        <b>Absorb more</b>
        <span>{dish.absorption}</span>
      </section>

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
          {dish.ingredients.map((ing, i) => {
            const de = region === 'DE' ? germanName(ing.name) : undefined
            return (
              <li key={i}>
                <span className="ing-qty">{fmtIng(ing.qty * mult, ing.unit)}</span>
                <span className="ing-name">
                  {ing.name}
                  {ing.note && (region === 'DE' || !/aldi|rewe|lidl|edeka/i.test(ing.note)) && <em> · {ing.note}</em>}
                  {de && <div className="ing-de">{de}</div>}
                </span>
              </li>
            )
          })}
        </ul>
        <div className="faint xs" style={{ marginTop: 8 }}>
          Estimated cost {perServing ? 'per serving' : 'for the family'}: <b>{fmtMoney(region, cost)}</b>
        </div>
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
        <section className="tip green">
          <b>Tip</b>
          <span>{dish.tip}</span>
        </section>
      )}

      <section className="card flat">
        <div className="card-title">Measures used</div>
        <div className="measures">
          {MEASURES.map((m) => (
            <span key={m.name}>
              <b>{m.name}</b> ≈ {m.ml} ml
            </span>
          ))}
          <span>
            <b>1 cup cooked rice</b> ≈ 160 g
          </span>
        </div>
      </section>
    </Sheet>
  )
}
