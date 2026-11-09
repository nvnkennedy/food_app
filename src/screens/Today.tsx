import { useState } from 'react'
import type { Dish, Slot } from '../data/types'
import { useFamily } from '../state'
import { MealCard } from '../components/MealCard'
import { RecipeSheet } from '../components/RecipeSheet'
import { SwapSheet } from '../components/SwapSheet'
import { NutrientPanel } from '../components/NutrientPanel'
import { IconChevronLeft, IconChevronRight, IconToday } from '../components/Icons'
import { SLOT_ORDER } from '../lib/nutrition'
import { addDays, fmtDow, fmtDayNum, fromISO, todayISO, weekStart, type ISODate } from '../lib/dates'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DOWS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function heading(date: ISODate, today: ISODate): string {
  if (date === today) return 'Today'
  if (date === addDays(today, 1)) return 'Tomorrow'
  if (date === addDays(today, -1)) return 'Yesterday'
  return DOWS[fromISO(date).getDay()]
}

export function Today({ date, setDate, goToMe }: { date: ISODate; setDate: (d: ISODate) => void; goToMe: () => void }) {
  const { byId, people, overrides, setOverride, mealsOn } = useFamily()
  const [open, setOpen] = useState<Slot | null>(null)
  const [swap, setSwap] = useState<Slot | null>(null)

  const meals = mealsOn(date)
  const today = todayISO()
  const dayOv = overrides[date] ?? {}
  const d = fromISO(date)
  const ws = weekStart(date)
  const week = Array.from({ length: 7 }, (_, i) => addDays(ws, i))

  const openDish: Dish | undefined = open ? byId.get(meals[open]) : undefined
  const swapDish: Dish | undefined = swap ? byId.get(meals[swap]) : undefined
  const lambToday = (['lunch', 'dinner'] as Slot[]).some((s) => byId.get(meals[s])?.protein === 'lamb')

  return (
    <>
      <header className="top">
        <div>
          <div className="eyebrow">
            {d.getDate()} {MONTHS[d.getMonth()]} {d.getFullYear()}
          </div>
          <h1 className="h1">{heading(date, today)}</h1>
        </div>
        <div className="row">
          <button className="icon-btn" onClick={() => setDate(addDays(date, -7))} aria-label="Previous week">
            <IconChevronLeft />
          </button>
          {date !== today && (
            <button className="icon-btn" onClick={() => setDate(today)} aria-label="Jump to today" title="Today">
              <IconToday />
            </button>
          )}
          <button className="icon-btn" onClick={() => setDate(addDays(date, 7))} aria-label="Next week">
            <IconChevronRight />
          </button>
        </div>
      </header>

      <div className="strip" role="tablist" aria-label="Days of the week">
        {week.map((wd) => (
          <button key={wd} role="tab" aria-selected={wd === date} className={'strip-day' + (wd === date ? ' selected' : '') + (wd === today ? ' is-today' : '')} onClick={() => setDate(wd)}>
            <span className="d">{fmtDow(wd).slice(0, 2)}</span>
            <span className="n">{fmtDayNum(wd)}</span>
            {overrides[wd] && wd !== date && <span className="dot" />}
          </button>
        ))}
      </div>

      {people.length === 0 ? (
        <div className="card cta">
          <span className="emoji" aria-hidden>
            🎯
          </span>
          <div className="grow">
            <div className="h3">Set your targets</div>
            <div className="muted small">Add you and your partner to get daily calorie, protein, iron, zinc and magnesium targets and plates sized for each of you.</div>
          </div>
          <button className="btn sm" onClick={goToMe}>
            Set up
          </button>
        </div>
      ) : (
        <NutrientPanel meals={meals} />
      )}

      {lambToday && (
        <div className="banner">
          <span aria-hidden>🐑</span> Lamb treat today. Lamb is the richest zinc source on the menu; the next one comes in two months.
        </div>
      )}

      {SLOT_ORDER.map((slot) => (
        <MealCard key={slot} slot={slot} dish={byId.get(meals[slot])} swapped={!!dayOv[slot]} onOpen={() => setOpen(slot)} onSwap={() => setSwap(slot)} />
      ))}

      <div className="faint xs" style={{ textAlign: 'center', padding: '0 12px' }}>
        Tap a meal for the recipe, nutrients and how to absorb more. No tea or coffee within an hour of iron-rich meals.
      </div>

      {open && openDish && (
        <RecipeSheet
          dish={openDish}
          slot={open}
          onClose={() => setOpen(null)}
          onSwap={() => {
            setSwap(open)
            setOpen(null)
          }}
        />
      )}
      {swap && (
        <SwapSheet
          slot={swap}
          current={swapDish}
          isOverridden={!!dayOv[swap]}
          onPick={(dish) => {
            setOverride(date, swap, dish.id)
            setSwap(null)
          }}
          onReset={() => {
            setOverride(date, swap, null)
            setSwap(null)
          }}
          onClose={() => setSwap(null)}
        />
      )}
    </>
  )
}
