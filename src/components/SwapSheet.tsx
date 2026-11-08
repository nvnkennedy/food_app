import { useMemo, useState } from 'react'
import type { Dish, Slot } from '../data/types'
import { Sheet } from './Sheet'
import { PROTEIN_LABEL, CUISINE_LABEL, dishEmoji } from './Chips'
import { IconSearch } from './Icons'
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
          <button className="btn secondary wide" onClick={onReset}>
            Back to the planned meal
          </button>
        ) : undefined
      }
    >
      {current && (
        <div className="muted small">
          Currently: <b>{current.name}</b>
        </div>
      )}
      <div className="search">
        <IconSearch size={18} />
        <input placeholder="Search dishes…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
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
            <button className={`swap-item slot-${slot}`} onClick={() => onPick(d)}>
              <span className="meal-ico" aria-hidden>
                {dishEmoji(d, slot)}
              </span>
              <span className="grow">
                <div className="swap-name">{d.name}</div>
                <div className="chips">
                  <span className={`chip chip-${d.protein}`}>{PROTEIN_LABEL[d.protein]}</span>
                  <span className={`chip${d.cuisine === 'pasta' ? ' chip-pasta' : ''}`}>{CUISINE_LABEL[d.cuisine]}</span>
                </div>
              </span>
              <span className="swap-nutri">
                <b>{d.kcal}</b> kcal
                <br />
                {d.protein_g} g protein
              </span>
            </button>
          </li>
        ))}
        {list.length === 0 && <li className="muted">Nothing matches.</li>}
      </ul>
    </Sheet>
  )
}
