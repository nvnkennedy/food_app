import { useMemo, useState } from 'react'
import type { Dish, Slot } from '../data/types'
import { Sheet } from './Sheet'
import { DishChips, PROTEIN_LABEL, CUISINE_LABEL } from './Chips'
import { alternativesFor } from '../lib/planner'
import { useFamily } from '../state'
import { SLOT_LABEL } from '../lib/nutrition'

export function SwapSheet({ slot, current, isOverridden, onPick, onReset, onClose }: { slot: Slot; current: Dish | undefined; isOverridden: boolean; onPick: (d: Dish) => void; onReset: () => void; onClose: () => void }) {
  const { dishes } = useFamily()
  const [q, setQ] = useState('')
  const [protein, setProtein] = useState<string>('all')

  const list = useMemo(() => {
    const alts = alternativesFor(current, slot, dishes)
    const needle = q.trim().toLowerCase()
    return alts.filter((d) => (protein === 'all' || d.protein === protein) && (!needle || d.name.toLowerCase().includes(needle) || (d.localName ?? '').toLowerCase().includes(needle) || CUISINE_LABEL[d.cuisine].toLowerCase().includes(needle)))
  }, [current, slot, dishes, q, protein])

  const proteins = ['all', 'veg', 'egg', 'chicken', 'fish', 'prawn', 'lamb']

  return (
    <Sheet
      title={`Swap ${SLOT_LABEL[slot].toLowerCase()}`}
      onClose={onClose}
      footer={
        isOverridden ? (
          <button className="btn btn-outline wide" onClick={onReset}>
            Back to the planned meal
          </button>
        ) : undefined
      }
    >
      <input className="input" placeholder="Search dishes…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
      <div className="filter-row">
        {proteins.map((p) => (
          <button key={p} className={'pill' + (protein === p ? ' active' : '')} onClick={() => setProtein(p)}>
            {p === 'all' ? 'All' : PROTEIN_LABEL[p as Dish['protein']]}
          </button>
        ))}
      </div>
      <ul className="swap-list">
        {list.map((d) => (
          <li key={d.id}>
            <button className="swap-item" onClick={() => onPick(d)}>
              <div>
                <div className="swap-name">{d.name}</div>
                <DishChips dish={d} compact />
              </div>
              <div className="swap-nutri">
                <b>{d.kcal}</b> kcal
                <br />
                {d.protein_g} g prot
              </div>
            </button>
          </li>
        ))}
        {list.length === 0 && <li className="muted">Nothing matches.</li>}
      </ul>
    </Sheet>
  )
}
