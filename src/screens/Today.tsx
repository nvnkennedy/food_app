import { useState } from 'react'
import type { Dish, Slot } from '../data/types'
import { useFamily } from '../state'
import { MealCard } from '../components/MealCard'
import { RecipeSheet } from '../components/RecipeSheet'
import { SwapSheet } from '../components/SwapSheet'
import { NutrientPanel } from '../components/NutrientPanel'
import { IconChevronLeft, IconChevronRight, IconToday } from '../components/Icons'
import { SLOT_ORDER } from '../lib/nutrition'
import { addDays, fmtDow, fmtDayNum, fromISO, isWeekend, todayISO, weekStart, type ISODate } from '../lib/dates'
import { isFeastDay, isLambMonth } from '../lib/planner'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DOWS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function heading(date: ISODate, today: ISODate): string {
  if (date === today) return 'Today'
  if (date === addDays(today, 1)) return 'Tomorrow'
  if (date === addDays(today, -1)) return 'Yesterday'
  return DOWS[fromISO(date).getDay()]
}

export function Today({ date, setDate }: { date: ISODate; setDate: (d: ISODate) => void }) {
  const { byId, overrides, setOverride, mealsOn } = useFamily()
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
  const feast = isFeastDay(date)
  const weekend = isWeekend(date)

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
          <button key={wd} role="tab" aria-selected={wd === date} className={'strip-day' + (wd === date ? ' selected' : '') + (wd === today ? ' is-today' : '') + (isFeastDay(wd) ? ' is-feast' : '')} onClick={() => setDate(wd)}>
            <span className="d">{fmtDow(wd).slice(0, 2)}</span>
            <span className="n">{fmtDayNum(wd)}</span>
            {(overrides[wd] || isFeastDay(wd)) && wd !== date && <span className="dot" />}
          </button>
        ))}
      </div>

      <NutrientPanel meals={meals} />

      {feast && (
        <div className="banner feast-banner">
          <span aria-hidden>🎉</span>
          <span>
            <b>Feast day.</b> The one proper celebration meal of the month{isLambMonth(d.getMonth()) ? ', and this month it is lamb' : ''}. Lunch is bigger, dinner stays light.
          </span>
        </div>
      )}
      {weekend && !feast && (
        <div className="faint xs" style={{ padding: '0 4px' }}>
          Weekend: North Indian plates and light soups or salads may appear as extras. Weekdays stay South Indian.
        </div>
      )}

      {SLOT_ORDER.map((slot) => (
        <MealCard key={slot} slot={slot} dish={byId.get(meals[slot])} swapped={!!dayOv[slot]} onOpen={() => setOpen(slot)} onSwap={() => setSwap(slot)} />
      ))}

      <div className="faint xs" style={{ textAlign: 'center', padding: '0 12px' }}>
        Tap a meal for the recipe, nutrients, cost and how to absorb more. No tea or coffee within an hour of iron-rich meals.
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
