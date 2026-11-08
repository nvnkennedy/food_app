import { useMemo, useState } from 'react'
import { useFamily } from '../state'
import { generateMonth, monthStats } from '../lib/planner'
import { fmtDow, fmtDayNum, fmtMonth, isWeekend, todayISO, type ISODate } from '../lib/dates'
import { PROTEIN_LABEL } from '../components/Chips'
import type { Dish } from '../data/types'

export function Plan({ openDay }: { openDay: (d: ISODate) => void }) {
  const { dishes, byId, overrides } = useFamily()
  const now = new Date()
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const today = todayISO()

  const plan = useMemo(() => generateMonth(ym.y, ym.m, dishes), [ym, dishes])
  const stats = useMemo(() => monthStats(plan, byId), [plan, byId])

  const shift = (n: number) => {
    const d = new Date(ym.y, ym.m + n, 1)
    setYm({ y: d.getFullYear(), m: d.getMonth() })
  }

  const name = (id: string, date: ISODate, slot: keyof typeof overrides[string]) => {
    const ov = overrides[date]?.[slot]
    const d: Dish | undefined = byId.get(ov ?? id)
    return d ? d.name : '—'
  }

  return (
    <>
      <header className="top">
        <div className="brand">Monthly plan</div>
        <div className="date-nav">
          <button className="icon-btn" onClick={() => shift(-1)} aria-label="Previous month">
            ‹
          </button>
          <span className="date-label">{fmtMonth(ym.y, ym.m)}</span>
          <button className="icon-btn" onClick={() => shift(1)} aria-label="Next month">
            ›
          </button>
        </div>
      </header>

      <div className="card stats">
        <div className="stat-line">
          {(['chicken', 'fish', 'egg', 'prawn', 'lamb', 'veg'] as const).map((p) => (
            <span key={p} className={`chip chip-${p}`}>
              {PROTEIN_LABEL[p]} {stats.proteins[p] ?? 0}
            </span>
          ))}
          <span className="chip chip-cuisine-pasta">Pasta {Math.round(stats.pastaShare * 100)}%</span>
        </div>
        <div className="muted small">Same plan on every phone. Swaps you make are marked and stay on this phone.</div>
      </div>

      <ul className="days">
        {plan.map((day) => {
          const isToday = day.date === today
          const swapped = !!overrides[day.date]
          return (
            <li key={day.date} className={'day' + (isToday ? ' today' : '') + (isWeekend(day.date) ? ' weekend' : '')}>
              <button className="day-btn" onClick={() => openDay(day.date)}>
                <div className="day-date">
                  <div className="day-num">{fmtDayNum(day.date)}</div>
                  <div className="day-dow">{fmtDow(day.date)}</div>
                </div>
                <div className="day-meals">
                  <div>
                    <span className="k">B</span> {name(day.meals.breakfast, day.date, 'breakfast')}
                  </div>
                  <div>
                    <span className="k">L</span> {name(day.meals.lunch, day.date, 'lunch')}
                  </div>
                  <div>
                    <span className="k">D</span> {name(day.meals.dinner, day.date, 'dinner')}
                  </div>
                </div>
                {swapped && <span className="swapped">✎</span>}
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}
