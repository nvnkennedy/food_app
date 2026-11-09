import { useMemo, useState } from 'react'
import { useFamily } from '../state'
import { useStored } from '../lib/storage'
import { groceryFor, fmtQty, type Group, type GroceryLine } from '../lib/grocery'
import { addDays, fmtShort, todayISO, weekStart, type ISODate } from '../lib/dates'
import type { DayPlan } from '../lib/planner'
import { IconCheck, IconChevronLeft, IconChevronRight } from '../components/Icons'
import { germanName } from '../data/germanNames'
import { costOf, fmtMoney } from '../data/prices'

const GROUP_TITLE: Record<Group, string> = { german: 'Supermarket', indian: 'Indian store', market: 'Shopping list', pantry: 'Pantry' }
const GROUP_SUB: Record<Group, string> = {
  german: 'Aldi · Lidl · Rewe · Edeka',
  indian: 'Dals, rice, spices, curry leaves',
  market: 'Vegetables, dals, dairy, meat and fish',
  pantry: 'Spices and staples: check you still have these'
}

export function Grocery() {
  const { byId, familyFactor, mealsOn, settings, setSettings } = useFamily()
  const region = settings.region
  const [start, setStart] = useState<ISODate>(weekStart(todayISO()))
  const [checked, setChecked] = useStored<Record<string, boolean>>('grocery-checked', {})
  const groupsOrder: Group[] = region === 'IN' ? ['market', 'pantry'] : ['german', 'indian', 'pantry']
  const [group, setGroup] = useState<Group>(groupsOrder[0])
  const [editBudget, setEditBudget] = useState(false)

  const days: DayPlan[] = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(start, i)).map((date) => ({ date, meals: mealsOn(date) })), [start, mealsOn])
  const groups = useMemo(() => groceryFor(days, byId, familyFactor, region), [days, byId, familyFactor, region])

  const lineCost = (l: GroceryLine) => costOf(region, l.name, l.qty, l.unit)

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

  const shopping = groupsOrder.filter((g) => g !== 'pantry').flatMap((g) => groups[g])
  const done = shopping.filter((l) => checked[key(l.key)]).length
  const total = shopping.reduce((s, l) => s + lineCost(l), 0)
  const pantryTotal = groups.pantry.reduce((s, l) => s + lineCost(l), 0)
  const budget = settings.weeklyBudget
  const over = budget > 0 && total > budget
  const current = groupsOrder.includes(group) ? group : groupsOrder[0]
  const lines = groups[current]
  const expensive = [...shopping].sort((a, b) => lineCost(b) - lineCost(a)).slice(0, 3)

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

      <div className="card col" style={{ gap: 10 }}>
        <div className="row-between">
          <div>
            <div className="h3">
              Estimated {fmtMoney(region, total)}
              {budget > 0 && <span className={'muted'}> of {fmtMoney(region, budget)}</span>}
            </div>
            <div className="muted xs">
              Whole family, 7 days, breakfast to dinner · {familyFactor}× adult servings{pantryTotal > 0 ? ` · pantry refills ≈ ${fmtMoney(region, pantryTotal)} extra` : ''}
            </div>
          </div>
          <button className="link" onClick={() => setEditBudget((v) => !v)}>
            {budget > 0 ? 'Budget' : 'Set budget'}
          </button>
        </div>
        {editBudget && (
          <label className="field">
            Weekly budget
            <input type="number" inputMode="decimal" value={budget || ''} placeholder="e.g. 90" onChange={(e) => setSettings({ weeklyBudget: Math.max(0, parseFloat(e.target.value) || 0) })} autoFocus />
          </label>
        )}
        {budget > 0 && (
          <>
            <div className="progress">
              <div className={over ? 'over' : ''} style={{ width: Math.min(100, Math.round((total / budget) * 100)) + '%' }} />
            </div>
            <div className={'xs ' + (over ? 'bad' : 'good')}>
              {over ? `About ${fmtMoney(region, total - budget)} over budget. Biggest items: ${expensive.map((l) => `${l.name} ${fmtMoney(region, lineCost(l))}`).join(', ')}. Swap a meal and sort by "Cheapest" to bring it down.` : `${fmtMoney(region, budget - total)} under budget.`}
            </div>
          </>
        )}
        <div className="row-between xs muted">
          <span>
            {done} of {shopping.length} items ticked
          </span>
          {done > 0 && (
            <button className="link xs" onClick={clearWeek}>
              Untick all
            </button>
          )}
        </div>
      </div>

      <div className="seg">
        {groupsOrder.map((g) => (
          <button key={g} className={current === g ? 'active' : ''} onClick={() => setGroup(g)}>
            {GROUP_TITLE[g]}
            <span className="count">{groups[g].length}</span>
          </button>
        ))}
      </div>

      <section className="card">
        <div className="card-title">{GROUP_SUB[current]}</div>
        <ul className="grocery">
          {lines.map((l) => {
            const on = !!checked[key(l.key)]
            const de = region === 'DE' ? germanName(l.name) : undefined
            return (
              <li key={l.key} className={on ? 'done' : ''}>
                <label>
                  <input type="checkbox" checked={on} onChange={() => toggle(l.key)} />
                  <span className="check">
                    <IconCheck />
                  </span>
                  <span className="grow">
                    <div className="g-name">{l.name}</div>
                    {de && <div className="g-de">{de}</div>}
                    <div className="g-dishes">
                      {l.dishes.slice(0, 2).join(' · ')}
                      {l.dishes.length > 2 ? ` +${l.dishes.length - 2} more` : ''}
                    </div>
                  </span>
                  <span className="g-right">
                    <span className="g-qty">{fmtQty(l)}</span>
                    <span className="g-cost">{fmtMoney(region, lineCost(l))}</span>
                  </span>
                </label>
              </li>
            )
          })}
          {lines.length === 0 && <li className="muted small">Nothing needed from here this week.</li>}
        </ul>
      </section>
      <div className="faint xs" style={{ padding: '0 4px' }}>
        Prices are estimates for {region === 'DE' ? 'Aldi / Lidl and Berlin Indian stores' : 'Indian supermarkets and markets'}; your receipt will differ a little.
      </div>
    </>
  )
}
