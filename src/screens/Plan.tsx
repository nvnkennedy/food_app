import { Fragment, useMemo, useState } from 'react'
import { useFamily } from '../state'
import { generateMonth, monthStats, feastDayOf, isLambMonth } from '../lib/planner'
import { fmtDow, fmtDayNum, fmtMonth, isWeekend, todayISO, type ISODate } from '../lib/dates'
import { PROTEIN_LABEL } from '../components/Chips'
import { IconChevronLeft, IconChevronRight } from '../components/Icons'
import type { Dish, Slot } from '../data/types'

export function Plan({ openDay }: { openDay: (d: ISODate) => void }) {
  const { dishes, byId, overrides } = useFamily()
  const now = new Date()
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const today = todayISO()

  const plan = useMemo(() => generateMonth(ym.y, ym.m, dishes), [ym, dishes])
  const stats = useMemo(() => monthStats(plan, byId), [plan, byId])
  const feast = feastDayOf(ym.y, ym.m)

  const shift = (n: number) => {
    const d = new Date(ym.y, ym.m + n, 1)
    setYm({ y: d.getFullYear(), m: d.getMonth() })
  }

  const name = (id: string, date: ISODate, slot: Slot) => {
    const ov = overrides[date]?.[slot]
    const d: Dish | undefined = byId.get(ov ?? id)
    return d ? d.name : '—'
  }

  return (
    <>
      <header className="top">
        <div>
          <div className="eyebrow">Monthly plan</div>
          <h1 className="h1">{fmtMonth(ym.y, ym.m)}</h1>
        </div>
        <div className="row">
          <button className="icon-btn" onClick={() => shift(-1)} aria-label="Previous month">
            <IconChevronLeft />
          </button>
          <button className="icon-btn" onClick={() => shift(1)} aria-label="Next month">
            <IconChevronRight />
          </button>
        </div>
      </header>

      <div className="card">
        <div className="card-title">This month</div>
        <div className="stat-row">
          {(['chicken', 'fish', 'egg', 'prawn', 'lamb', 'veg'] as const)
            .filter((p) => stats.proteins[p])
            .map((p) => (
              <span key={p} className={`chip chip-${p}`}>
                {PROTEIN_LABEL[p]} ×{stats.proteins[p]}
              </span>
            ))}
          <span className="chip">South Indian {Math.round(((stats.cuisines.south ?? 0) / Math.max(1, stats.mains)) * 100)}%</span>
        </div>
        <div className="muted xs" style={{ marginTop: 10 }}>
          🎉 Feast on {fmtDow(feast)} {fmtDayNum(feast)}{isLambMonth(ym.m) ? ' (lamb month)' : ''}. Same plan on every phone; swapped meals are marked and stay on this phone.
        </div>
      </div>

      <ul className="days">
        {plan.map((day, i) => {
          const isToday = day.date === today
          const swapped = !!overrides[day.date]
          const dow = fmtDow(day.date)
          const showWeek = i === 0 || dow === 'Mon'
          const isFeast = day.date === feast
          return (
            <Fragment key={day.date}>
              {showWeek && (
                <li className="week-label">
                  Week of {fmtDayNum(day.date)} {fmtMonth(ym.y, ym.m).split(' ')[0].slice(0, 3)}
                </li>
              )}
              <li className={'day' + (isToday ? ' today' : '') + (isWeekend(day.date) ? ' weekend' : '') + (isFeast ? ' feast' : '')}>
                <button className="day-btn" onClick={() => openDay(day.date)}>
                  <div className="day-badge">
                    <span className="n">{fmtDayNum(day.date)}</span>
                    <span className="d">{dow}</span>
                  </div>
                  <div className="day-meals">
                    <div className="slot-breakfast">
                      <span className="slot-dot" />
                      <span>{name(day.meals.breakfast, day.date, 'breakfast')}</span>
                    </div>
                    <div className="slot-lunch">
                      <span className="slot-dot" />
                      <span>{name(day.meals.lunch, day.date, 'lunch')}</span>
                    </div>
                    <div className="slot-dinner">
                      <span className="slot-dot" />
                      <span>{name(day.meals.dinner, day.date, 'dinner')}</span>
                    </div>
                  </div>
                  {isFeast && <span className="feast-tag corner">Feast</span>}
                  {swapped && !isFeast && <span className="swapped-tag">swapped</span>}
                </button>
              </li>
            </Fragment>
          )
        })}
      </ul>
    </>
  )
}
