import { useMemo, useState } from 'react'
import { useFamily } from '../state'
import { useStored } from '../lib/storage'
import { groceryFor, fmtQty, type Group } from '../lib/grocery'
import { addDays, fmtShort, todayISO, weekStart, type ISODate } from '../lib/dates'
import type { DayPlan } from '../lib/planner'

const GROUP_TITLE: Record<Group, string> = {
  german: 'German supermarket · Rewe / Lidl / Edeka',
  indian: 'Indian store',
  pantry: 'Pantry · check you still have'
}

export function Grocery() {
  const { byId, familyFactor, mealsOn } = useFamily()
  const [start, setStart] = useState<ISODate>(weekStart(todayISO()))
  const [checked, setChecked] = useStored<Record<string, boolean>>('grocery-checked', {})
  const [showPantry, setShowPantry] = useState(false)

  const days: DayPlan[] = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(start, i)).map((date) => ({ date, meals: mealsOn(date) })), [start, mealsOn])
  const groups = useMemo(() => groceryFor(days, byId, familyFactor), [days, byId, familyFactor])

  const thisWeek = weekStart(todayISO())
  const label = start === thisWeek ? 'This week' : start === addDays(thisWeek, 7) ? 'Next week' : 'Week'
  const key = (k: string) => `${start}|${k}`
  const toggle = (k: string) => setChecked((prev) => ({ ...prev, [key(k)]: !prev[key(k)] }))
  const clearWeek = () =>
    setChecked((prev) => {
      const next: Record<string, boolean> = {}
      for (const k of Object.keys(prev)) if (!k.startsWith(start + '|')) next[k] = prev[k]
      return next
    })

  const renderGroup = (g: Group) => {
    const lines = groups[g]
    const done = lines.filter((l) => checked[key(l.key)]).length
    return (
      <section key={g} className="card">
        <div className="row-between">
          <h4>{GROUP_TITLE[g]}</h4>
          <span className="muted small">
            {done}/{lines.length}
          </span>
        </div>
        <ul className="grocery">
          {lines.map((l) => {
            const on = !!checked[key(l.key)]
            return (
              <li key={l.key} className={on ? 'done' : ''}>
                <label>
                  <input type="checkbox" checked={on} onChange={() => toggle(l.key)} />
                  <span className="g-name">{l.name}</span>
                  <span className="g-qty">{fmtQty(l)}</span>
                </label>
                <div className="g-dishes">{l.dishes.slice(0, 3).join(' · ')}{l.dishes.length > 3 ? ` +${l.dishes.length - 3}` : ''}</div>
              </li>
            )
          })}
        </ul>
      </section>
    )
  }

  return (
    <>
      <header className="top">
        <div className="brand">Grocery list</div>
        <div className="date-nav">
          <button className="icon-btn" onClick={() => setStart(addDays(start, -7))} aria-label="Previous week">
            ‹
          </button>
          <button className="date-label" onClick={() => setStart(thisWeek)}>
            {label} · {fmtShort(start)} – {fmtShort(addDays(start, 6))}
          </button>
          <button className="icon-btn" onClick={() => setStart(addDays(start, 7))} aria-label="Next week">
            ›
          </button>
        </div>
      </header>

      <div className="muted small pad">
        Quantities for the whole family ({familyFactor}× adult servings), all 7 days, breakfast to dinner. Tick things off as you shop.{' '}
        <button className="link-btn" onClick={clearWeek}>
          Untick all
        </button>
      </div>

      {renderGroup('german')}
      {renderGroup('indian')}
      <button className="link-btn pad" onClick={() => setShowPantry((v) => !v)}>
        {showPantry ? 'Hide' : 'Show'} pantry staples ({groups.pantry.length})
      </button>
      {showPantry && renderGroup('pantry')}
    </>
  )
}
