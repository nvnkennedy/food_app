import { useMemo, useState } from 'react'
import { useFamily } from '../state'
import { useStored } from '../lib/storage'
import { groceryFor, fmtQty, type Group } from '../lib/grocery'
import { addDays, fmtShort, todayISO, weekStart, type ISODate } from '../lib/dates'
import type { DayPlan } from '../lib/planner'
import { IconCheck, IconChevronLeft, IconChevronRight } from '../components/Icons'
import { germanName } from '../data/germanNames'

const GROUP_TITLE: Record<Group, string> = { german: 'Supermarket', indian: 'Indian store', pantry: 'Pantry' }
const GROUP_SUB: Record<Group, string> = { german: 'Rewe · Lidl · Edeka · Aldi', indian: 'Dals, rice, spices, curry leaves', pantry: 'Check you still have these' }

export function Grocery() {
  const { byId, familyFactor, mealsOn } = useFamily()
  const [start, setStart] = useState<ISODate>(weekStart(todayISO()))
  const [checked, setChecked] = useStored<Record<string, boolean>>('grocery-checked', {})
  const [group, setGroup] = useState<Group>('german')

  const days: DayPlan[] = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(start, i)).map((date) => ({ date, meals: mealsOn(date) })), [start, mealsOn])
  const groups = useMemo(() => groceryFor(days, byId, familyFactor), [days, byId, familyFactor])

  const thisWeek = weekStart(todayISO())
  const label = start === thisWeek ? 'This week' : start === addDays(thisWeek, 7) ? 'Next week' : start === addDays(thisWeek, -7) ? 'Last week' : 'Week'
  const key = (k: string) => `${start}|${k}`
  const toggle = (k: string) => setChecked((prev) => ({ ...prev, [key(k)]: !prev[key(k)] }))
  const clearWeek = () =>
    setChecked((prev) => {
      const next: Record<string, boolean> = {}
      for (const k of Object.keys(prev)) if (!k.startsWith(start + '|')) next[k] = prev[k]
      return next
    })

  const shopping = [...groups.german, ...groups.indian]
  const done = shopping.filter((l) => checked[key(l.key)]).length
  const lines = groups[group]

  return (
    <>
      <header className="top">
        <div>
          <div className="eyebrow">
            {fmtShort(start)} – {fmtShort(addDays(start, 6))}
          </div>
          <h1 className="h1">{label}</h1>
        </div>
        <div className="row">
          <button className="icon-btn" onClick={() => setStart(addDays(start, -7))} aria-label="Previous week">
            <IconChevronLeft />
          </button>
          <button className="icon-btn" onClick={() => setStart(addDays(start, 7))} aria-label="Next week">
            <IconChevronRight />
          </button>
        </div>
      </header>

      <div className="card">
        <div className="row-between">
          <div>
            <div className="h3">
              {done} of {shopping.length} bought
            </div>
            <div className="muted xs">For the whole family, 7 days, breakfast to dinner · {familyFactor}× adult servings</div>
          </div>
          {done > 0 && (
            <button className="link" onClick={clearWeek}>
              Reset
            </button>
          )}
        </div>
        <div className="progress" style={{ marginTop: 10 }}>
          <div style={{ width: shopping.length ? Math.round((done / shopping.length) * 100) + '%' : 0 }} />
        </div>
      </div>

      <div className="seg">
        {(['german', 'indian', 'pantry'] as Group[]).map((g) => (
          <button key={g} className={group === g ? 'active' : ''} onClick={() => setGroup(g)}>
            {GROUP_TITLE[g]}
            <span className="count">{groups[g].length}</span>
          </button>
        ))}
      </div>

      <section className="card">
        <div className="card-title">{GROUP_SUB[group]}</div>
        <ul className="grocery">
          {lines.map((l) => {
            const on = !!checked[key(l.key)]
            return (
              <li key={l.key} className={on ? 'done' : ''}>
                <label>
                  <input type="checkbox" checked={on} onChange={() => toggle(l.key)} />
                  <span className="check">
                    <IconCheck />
                  </span>
                  <span className="grow">
                    <div className="g-name">{l.name}</div>
                    {germanName(l.name) && <div className="g-de">{germanName(l.name)}</div>}
                    <div className="g-dishes">
                      {l.dishes.slice(0, 2).join(' · ')}
                      {l.dishes.length > 2 ? ` +${l.dishes.length - 2} more` : ''}
                    </div>
                  </span>
                  <span className="g-qty">{fmtQty(l)}</span>
                </label>
              </li>
            )
          })}
          {lines.length === 0 && <li className="muted small">Nothing needed from here this week.</li>}
        </ul>
      </section>
    </>
  )
}
