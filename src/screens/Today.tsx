import { useMemo, useState } from 'react'
import type { Dish, Slot } from '../data/types'
import { useFamily, CHILD } from '../state'
import { MealCard } from '../components/MealCard'
import { RecipeSheet } from '../components/RecipeSheet'
import { SwapSheet } from '../components/SwapSheet'
import { Ring } from '../components/Ring'
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
  const { byId, people, childEnabled, overrides, setOverride, mealsOn, portionFor } = useFamily()
  const [open, setOpen] = useState<Slot | null>(null)
  const [swap, setSwap] = useState<Slot | null>(null)

  const meals = mealsOn(date)
  const today = todayISO()
  const dayOv = overrides[date] ?? {}
  const d = fromISO(date)
  const ws = weekStart(date)
  const week = Array.from({ length: 7 }, (_, i) => addDays(ws, i))

  const totals = useMemo(
    () =>
      people.map((p) => {
        let kcal = 0
        let prot = 0
        for (const slot of SLOT_ORDER) {
          const dish = byId.get(meals[slot])
          if (!dish) continue
          const f = portionFor(dish, slot, p)
          kcal += dish.kcal * f
          prot += dish.protein_g * f
        }
        return { p, kcal: Math.round(kcal), prot: Math.round(prot) }
      }),
    [people, meals, byId, portionFor]
  )

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
            <div className="muted small">Add you and your partner to get daily calorie goals and personal portion sizes on every meal.</div>
          </div>
          <button className="btn sm" onClick={goToMe}>
            Set up
          </button>
        </div>
      ) : (
        <div className="card col" style={{ gap: 12 }}>
          {totals.map(({ p, kcal, prot }, i) => (
            <div key={p.profile.id} className="person">
              <Ring value={kcal} max={p.targets.kcal} label={`${p.profile.name} calories`} />
              <div className="grow">
                <div className="row-between">
                  <span className="name row" style={{ gap: 6 }}>
                    <span className={'avatar' + (i === 1 ? ' a2' : '')}>{p.profile.name.slice(0, 1).toUpperCase()}</span>
                    {p.profile.name}
                  </span>
                  <span className={'small ' + (kcal > p.targets.kcal * 1.05 ? 'bad' : 'muted')}>
                    <b>{kcal}</b> / {p.targets.kcal} kcal
                  </span>
                </div>
                <div className="mini">
                  <div style={{ width: Math.min(100, Math.round((prot / p.targets.protein_g) * 100)) + '%' }} />
                </div>
                <div className="row-between xs faint" style={{ marginTop: 3 }}>
                  <span>Protein</span>
                  <span>
                    {prot} / {p.targets.protein_g} g
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {lambToday && (
        <div className="banner">
          <span aria-hidden>🐑</span> Lamb treat today. The next one comes in two months.
        </div>
      )}

      {SLOT_ORDER.map((slot) => (
        <MealCard key={slot} slot={slot} dish={byId.get(meals[slot])} swapped={!!dayOv[slot]} onOpen={() => setOpen(slot)} onSwap={() => setSwap(slot)} />
      ))}

      {childEnabled && (
        <div className="faint xs" style={{ textAlign: 'center', padding: '0 12px' }}>
          Little one eats the same food, about {CHILD.factor}× portions, chilli reduced.
        </div>
      )}

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
