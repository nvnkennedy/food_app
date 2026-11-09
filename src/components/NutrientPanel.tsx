import { useMemo, useState } from 'react'
import type { Slot } from '../data/types'
import { useFamily } from '../state'
import { fmtNutrient, NUTRIENTS, scaled, SLOT_ORDER, type NutrientKey } from '../lib/nutrition'
import { addDays, weekStart, type ISODate } from '../lib/dates'
import { IconChevronRight } from './Icons'

type Mode = 'day' | 'week'

const ZERO: Record<NutrientKey, number> = { kcal: 0, protein_g: 0, fiber_g: 0, iron_mg: 0, zinc_mg: 0, magnesium_mg: 0 }

function statusClass(key: NutrientKey, pct: number): string {
  if (key === 'kcal') return pct > 105 ? 'over' : pct >= 85 ? 'ok' : 'mid'
  return pct >= 90 ? 'ok' : pct < 60 ? 'low' : 'mid'
}

/**
 * Collapsed: one line per person (calories + the nutrient furthest from target).
 * Expanded: a table, rows = nutrients, columns = family members; Day or Week average.
 */
export function NutrientPanel({ date, meals }: { date: ISODate; meals: Record<Slot, string> }) {
  const { byId, people, portionFor, eaten, mealsOn } = useFamily()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('day')
  const eatenToday = eaten[date] ?? {}
  const anyEaten = Object.keys(eatenToday).length > 0
  const [onlyEaten, setOnlyEaten] = useState(false)

  const totals = useMemo(() => {
    const per = people.map(() => ({ ...ZERO }))
    const addDay = (dayMeals: Record<Slot, string>, filter?: Partial<Record<Slot, boolean>>) => {
      for (const slot of SLOT_ORDER) {
        if (filter && !filter[slot]) continue
        const d = byId.get(dayMeals[slot])
        if (!d) continue
        people.forEach((p, i) => {
          const s = scaled(d, portionFor(d, slot, p))
          for (const n of NUTRIENTS) per[i][n.key] += s[n.key]
        })
      }
    }
    if (mode === 'day') addDay(meals, onlyEaten && anyEaten ? eatenToday : undefined)
    else {
      const ws = weekStart(date)
      for (let i = 0; i < 7; i++) addDay(mealsOn(addDays(ws, i)))
      for (const t of per) for (const n of NUTRIENTS) t[n.key] /= 7
    }
    return per
  }, [people, meals, byId, portionFor, mode, onlyEaten, anyEaten, eatenToday, date, mealsOn])

  if (people.length === 0) return null

  // one-line summary per person: calories and the weakest nutrient
  const summary = people.map((p, i) => {
    const kcalPct = Math.round((totals[i].kcal / p.targets.kcal) * 100)
    let weak: { label: string; pct: number } | null = null
    for (const n of NUTRIENTS) {
      if (n.key === 'kcal') continue
      const pct = Math.round((totals[i][n.key] / p.targets[n.key]) * 100)
      if (!weak || pct < weak.pct) weak = { label: n.label, pct }
    }
    return { p, kcalPct, weak }
  })

  return (
    <section className="card col" style={{ gap: 10 }}>
      <button className="row-between panel-head" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <div>
          <div className="card-title" style={{ marginBottom: 0 }}>
            Nutrients {mode === 'week' ? '· week average' : '· today'}
          </div>
          {!open && <div className="faint xs">Tap for the full table with protein, fibre, iron, zinc and magnesium</div>}
        </div>
        <IconChevronRight size={18} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }} />
      </button>

      {!open && (
        <ul className="nsummary">
          {summary.map(({ p, kcalPct, weak }) => (
            <li key={p.profile.id}>
              <span className={'avatar ' + p.cls}>{p.profile.name.slice(0, 1).toUpperCase()}</span>
              <span className="grow">
                <b>{p.profile.name}</b>
                <span className="faint xs"> · {Math.round(totals[people.indexOf(p)].kcal)} / {p.targets.kcal} kcal</span>
              </span>
              <span className={'npct ' + statusClass('kcal', kcalPct)}>{kcalPct}%</span>
              {weak && (
                <span className={'nweak ' + (weak.pct < 60 ? 'low' : weak.pct < 90 ? 'mid' : 'ok')}>
                  {weak.label} {weak.pct}%
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {open && (
        <>
          <div className="row-between">
            <div className="faint xs">{mode === 'day' ? (onlyEaten && anyEaten ? 'Meals ticked as eaten today' : 'All four meals planned today') : 'Average per day this week'} · value / daily target</div>
            <div className="seg" style={{ padding: 3 }}>
              <button className={mode === 'day' ? 'active' : ''} onClick={() => setMode('day')}>
                Day
              </button>
              <button className={mode === 'week' ? 'active' : ''} onClick={() => setMode('week')}>
                Week
              </button>
            </div>
          </div>
          <table className="ntable">
            <thead>
              <tr>
                <th />
                {people.map((p) => (
                  <th key={p.profile.id}>
                    <span className={'avatar ' + p.cls}>{p.profile.name.slice(0, 1).toUpperCase()}</span>
                    <span className="nname">{p.profile.name.split(' ')[0]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NUTRIENTS.map((n) => (
                <tr key={n.key}>
                  <th>
                    {n.label}
                    <small>{n.unit}</small>
                  </th>
                  {people.map((p, i) => {
                    const v = totals[i][n.key]
                    const t = p.targets[n.key]
                    const pct = Math.round((v / t) * 100)
                    const cls = statusClass(n.key, pct)
                    return (
                      <td key={p.profile.id}>
                        <div className="nval">
                          <b>{fmtNutrient(n.key, v)}</b>
                          <span className="faint">/ {t}</span>
                        </div>
                        <div className="mini">
                          <div className={cls} style={{ width: Math.min(100, pct) + '%' }} />
                        </div>
                        <div className={'npct ' + cls}>{pct}%</div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {mode === 'day' && anyEaten && (
            <label className="row xs muted" style={{ gap: 8 }}>
              <input type="checkbox" checked={onlyEaten} onChange={(e) => setOnlyEaten(e.target.checked)} style={{ accentColor: 'var(--accent)' }} />
              Count only the meals ticked as eaten
            </label>
          )}
          <div className="faint xs">Green ≥ 90% of target, amber 60–90%, red below 60%. Calories turn red above 105%.</div>
        </>
      )}
    </section>
  )
}
