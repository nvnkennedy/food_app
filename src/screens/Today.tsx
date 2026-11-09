import { useState } from 'react'
import type { Dish, Slot } from '../data/types'
import { useFamily } from '../state'
import { MealCard } from '../components/MealCard'
import { RecipeSheet } from '../components/RecipeSheet'
import { SwapSheet } from '../components/SwapSheet'
import { NutrientPanel } from '../components/NutrientPanel'
import { IconChevronLeft, IconChevronRight, IconMoon, IconSun, IconToday } from '../components/Icons'
import { SLOT_ORDER } from '../lib/nutrition'
import { addDays, fmtDow, fmtDayNum, fromISO, isWeekend, todayISO, weekStart, type ISODate } from '../lib/dates'
import { isRegularFeastDay, isLambMonth, isFeast } from '../lib/planner'
import { prepFor } from '../lib/prep'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DOWS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function heading(date: ISODate, today: ISODate): string {
  if (date === today) return 'Today'
  if (date === addDays(today, 1)) return 'Tomorrow'
  if (date === addDays(today, -1)) return 'Yesterday'
  return DOWS[fromISO(date).getDay()]
}

export function Today({ date, setDate, goToFamily }: { date: ISODate; setDate: (d: ISODate) => void; goToFamily: () => void }) {
  const { byId, overrides, setOverride, dayOn, eaten, setEaten, settings, people, toggleTheme, toggleFeastDay } = useFamily()
  const [open, setOpen] = useState<Slot | null>(null)
  const [swap, setSwap] = useState<Slot | null>(null)

  const { meals, replaced } = dayOn(date)
  const today = todayISO()
  const dayOv = overrides[date] ?? {}
  const dayEaten = eaten[date] ?? {}
  const d = fromISO(date)
  const ws = weekStart(date)
  const week = Array.from({ length: 7 }, (_, i) => addDays(ws, i))

  const openDish: Dish | undefined = open ? byId.get(meals[open]) : undefined
  const swapDish: Dish | undefined = swap ? byId.get(meals[swap]) : undefined
  const regularFeast = isRegularFeastDay(date)
  const customFeast = settings.feastDays.includes(date)
  const feast = regularFeast || customFeast
  const isFeastDate = (x: ISODate) => isRegularFeastDay(x) || settings.feastDays.includes(x)
  const weekend = isWeekend(date)
  const dark = typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark'

  const tomorrow = dayOn(addDays(date, 1)).meals
  const prep = prepFor(SLOT_ORDER.map((s) => byId.get(tomorrow[s])).filter((x): x is Dish => !!x))

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
          <button className="icon-btn ghost" onClick={toggleTheme} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} title="Light / dark">
            {dark ? <IconSun /> : <IconMoon />}
          </button>
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
          <button key={wd} role="tab" aria-selected={wd === date} className={'strip-day' + (wd === date ? ' selected' : '') + (wd === today ? ' is-today' : '') + (isFeastDate(wd) ? ' is-feast' : '')} onClick={() => setDate(wd)}>
            <span className="d">{fmtDow(wd).slice(0, 2)}</span>
            <span className="n">{fmtDayNum(wd)}</span>
            {(overrides[wd] || isFeastDate(wd)) && wd !== date && <span className="dot" />}
          </button>
        ))}
      </div>

      {feast && (
        <div className="banner feast-banner row-between">
          <span>
            🎉 <b>Feast day.</b> {customFeast ? 'Marked by you.' : `The regular monthly feast${isLambMonth(d.getMonth()) ? ', lamb this month' : ''}.`} Lunch is the celebration, dinner stays light.
          </span>
          {customFeast && (
            <button className="link xs" onClick={() => toggleFeastDay(date)}>
              Remove
            </button>
          )}
        </div>
      )}

      {SLOT_ORDER.map((slot) => (
        <MealCard
          key={slot}
          slot={slot}
          dish={byId.get(meals[slot])}
          swapped={!!dayOv[slot]}
          replaced={replaced.includes(slot)}
          eaten={!!dayEaten[slot]}
          onToggleEaten={date <= today ? () => setEaten(date, slot, !dayEaten[slot]) : undefined}
          onOpen={() => setOpen(slot)}
          onSwap={() => setSwap(slot)}
        />
      ))}

      {people.length === 0 ? (
        <div className="card cta">
          <span className="emoji" aria-hidden>
            👨‍👩‍👦
          </span>
          <div className="grow">
            <div className="h3">Add your family</div>
            <div className="muted small">Names, ages and goals give each person their own plate sizes and nutrient targets.</div>
          </div>
          <button className="btn sm" onClick={goToFamily}>
            Add
          </button>
        </div>
      ) : (
        <NutrientPanel date={date} meals={meals} />
      )}

      {prep.length > 0 && (
        <section className="card prep">
          <div className="row" style={{ gap: 8 }}>
            <IconMoon size={18} />
            <div className="card-title" style={{ marginBottom: 0 }}>
              Tonight, for tomorrow
            </div>
          </div>
          <ul className="bullets" style={{ marginTop: 8 }}>
            {prep.slice(0, 5).map((p, i) => (
              <li key={i}>
                <span>
                  {p.text} <span className="faint">· {p.dish}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap', gap: 8 }}>
        {!regularFeast && (
          <button className="pill-btn" onClick={() => toggleFeastDay(date)}>
            {customFeast ? 'Remove feast day' : '🎉 Make this a feast day'}
          </button>
        )}
        {weekend && !feast && settings.adventurous && <span className="faint xs">Weekend: extras allowed</span>}
      </div>

      <div className="faint xs" style={{ textAlign: 'center', padding: '0 12px' }}>
        Tap a meal for the recipe, nutrients, cost and how to absorb more. Tick "Ate it" to track the day.
        {SLOT_ORDER.some((s) => byId.get(meals[s]) && isFeast(byId.get(meals[s])!)) ? '' : ' No tea or coffee within an hour of iron-rich meals.'}
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
          lunchDish={swap === 'dinner' ? byId.get(meals.lunch) : undefined}
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
