import { useState } from 'react'
import type { Dish, Slot } from '../data/types'
import { useFamily, CHILD } from '../state'
import { CHILD_TARGETS, fmtNutrient, NUTRIENTS, scaled, SLOT_ORDER, type NutrientKey } from '../lib/nutrition'
import { Ring } from './Ring'

/** Daily totals for every eater against their targets, with a person switcher. */
export function NutrientPanel({ meals }: { meals: Record<Slot, string> }) {
  const { byId, people, childEnabled, portionFor } = useFamily()
  const [sel, setSel] = useState(0)

  const eaters = [
    ...people.map((p, i) => ({ key: p.profile.id, name: p.profile.name, cls: i === 1 ? 'a2' : '', targets: p.targets, factor: (d: Dish, s: Slot) => portionFor(d, s, p) })),
    ...(childEnabled ? [{ key: 'kid', name: 'Little one', cls: 'kid', targets: CHILD_TARGETS, factor: () => CHILD.factor }] : [])
  ]
  if (eaters.length === 0) return null
  const e = eaters[Math.min(sel, eaters.length - 1)]

  const totals: Record<NutrientKey, number> = { kcal: 0, protein_g: 0, fiber_g: 0, iron_mg: 0, zinc_mg: 0, magnesium_mg: 0 }
  for (const slot of SLOT_ORDER) {
    const d = byId.get(meals[slot])
    if (!d) continue
    const s = scaled(d, e.factor(d, slot))
    for (const n of NUTRIENTS) totals[n.key] += s[n.key]
  }

  return (
    <section className="card col" style={{ gap: 12 }}>
      <div className="row-between">
        <div className="card-title" style={{ marginBottom: 0 }}>
          Today's nutrients
        </div>
        {eaters.length > 1 && (
          <div className="seg" style={{ padding: 3 }}>
            {eaters.map((x, i) => (
              <button key={x.key} className={i === sel ? 'active' : ''} onClick={() => setSel(i)}>
                {x.name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="person">
        <Ring value={totals.kcal} max={e.targets.kcal} label="Calories" />
        <div className="grow">
          <div className="row" style={{ gap: 6 }}>
            <span className={'avatar ' + e.cls}>{e.name.slice(0, 1).toUpperCase()}</span>
            <b>{e.name}</b>
          </div>
          <div className="small muted" style={{ marginTop: 2 }}>
            <b className={totals.kcal > e.targets.kcal * 1.05 ? 'bad' : ''}>{Math.round(totals.kcal)}</b> of {e.targets.kcal} kcal today
          </div>
        </div>
      </div>
      <ul className="nutri-rows">
        {NUTRIENTS.filter((n) => n.key !== 'kcal').map((n) => {
          const v = totals[n.key]
          const t = e.targets[n.key]
          const pct = Math.round((v / t) * 100)
          return (
            <li key={n.key}>
              <div className="row-between">
                <span className="nutri-label">{n.label}</span>
                <span className="small">
                  <b>{fmtNutrient(n.key, v)}</b> / {t} {n.unit} <em className={pct >= 90 ? 'good' : pct < 60 ? 'bad' : 'muted'}>{pct}%</em>
                </span>
              </div>
              <div className="mini">
                <div className={pct >= 90 ? '' : pct < 60 ? 'low' : 'mid'} style={{ width: Math.min(100, pct) + '%' }} />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
