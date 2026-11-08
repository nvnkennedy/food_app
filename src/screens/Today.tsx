import { useMemo, useState } from 'react'
import type { Dish, Slot } from '../data/types'
import { useFamily, CHILD } from '../state'
import { MealCard } from '../components/MealCard'
import { RecipeSheet } from '../components/RecipeSheet'
import { SwapSheet } from '../components/SwapSheet'
import { SLOT_ORDER } from '../lib/nutrition'
import { addDays, fmtShort, todayISO, type ISODate } from '../lib/dates'
import { isLambMonth } from '../lib/planner'

export function Today({ date, setDate }: { date: ISODate; setDate: (d: ISODate) => void }) {
  const { byId, people, childEnabled, overrides, setOverride, mealsOn, portionFor } = useFamily()
  const [open, setOpen] = useState<Slot | null>(null)
  const [swap, setSwap] = useState<Slot | null>(null)

  const meals = mealsOn(date)
  const today = todayISO()
  const dayOv = overrides[date] ?? {}

  const totals = useMemo(
    () =>
      people.map((p) => {
        let kcal = 0
        let prot = 0
        for (const slot of SLOT_ORDER) {
          const d = byId.get(meals[slot])
          if (!d) continue
          const f = portionFor(d, slot, p)
          kcal += d.kcal * f
          prot += d.protein_g * f
        }
        return { p, kcal: Math.round(kcal), prot: Math.round(prot) }
      }),
    [people, meals, byId, portionFor]
  )

  const openDish: Dish | undefined = open ? byId.get(meals[open]) : undefined
  const swapDish: Dish | undefined = swap ? byId.get(meals[swap]) : undefined
  const m0 = Number(date.slice(5, 7)) - 1

  return (
    <>
      <header className="top">
        <div className="brand">Ghar Ka Khana</div>
        <div className="date-nav">
          <button className="icon-btn" onClick={() => setDate(addDays(date, -1))} aria-label="Previous day">
            ‹
          </button>
          <button className="date-label" onClick={() => setDate(today)} title="Jump to today">
            {date === today ? 'Today · ' : ''}
            {fmtShort(date)}
          </button>
          <button className="icon-btn" onClick={() => setDate(addDays(date, 1))} aria-label="Next day">
            ›
          </button>
        </div>
      </header>

      {people.length === 0 ? (
        <div className="card hint">
          Portions are shown per standard adult serving. Add yourself and your partner under <b>Me</b> to get calorie targets and personal portion sizes.
        </div>
      ) : (
        <div className="card totals">
          {totals.map(({ p, kcal, prot }) => {
            const pct = Math.min(100, Math.round((kcal / p.targets.kcal) * 100))
            return (
              <div key={p.profile.id} className="total-row">
                <div className="row-between">
                  <b>{p.profile.name}</b>
                  <span>
                    {kcal} / {p.targets.kcal} kcal · {prot} g protein
                  </span>
                </div>
                <div className="bar">
                  <div className="bar-fill" style={{ width: pct + '%' }} />
                </div>
              </div>
            )
          })}
          {childEnabled && <div className="muted small">Little one: same food, about {CHILD.factor}× portions, chilli reduced.</div>}
        </div>
      )}

      {isLambMonth(m0) && <div className="note">🐑 Lamb month: one weekend lunch this month is a lamb treat.</div>}

      {SLOT_ORDER.map((slot) => (
        <MealCard key={slot} slot={slot} dish={byId.get(meals[slot])} swapped={!!dayOv[slot]} onOpen={() => setOpen(slot)} onSwap={() => setSwap(slot)} />
      ))}

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
          onPick={(d) => {
            setOverride(date, swap, d.id)
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
