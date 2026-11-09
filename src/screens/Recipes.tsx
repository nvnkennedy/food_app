import { useMemo, useState } from 'react'
import type { Dish, Slot } from '../data/types'
import { useFamily } from '../state'
import { RecipeSheet } from '../components/RecipeSheet'
import { PROTEIN_LABEL, CUISINE_LABEL, dishEmoji } from '../components/Chips'
import { IconHeart, IconSearch } from '../components/Icons'
import { isEveryday, isFeast } from '../lib/planner'
import { SLOT_LABEL } from '../lib/nutrition'

type Filter = 'all' | 'fav' | 'everyday' | 'occasional' | 'iron' | 'protein' | 'quick' | 'kid'

const SLOTS: (Slot | 'any')[] = ['any', 'breakfast', 'lunch', 'dinner', 'snack']

export function Recipes() {
  const { dishes, prefs } = useFamily()
  const [q, setQ] = useState('')
  const [slot, setSlot] = useState<Slot | 'any'>('any')
  const [protein, setProtein] = useState<string>('all')
  const [filter, setFilter] = useState<Filter>('all')
  const [open, setOpen] = useState<Dish | null>(null)

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return dishes
      .filter((d) => slot === 'any' || d.slots.includes(slot))
      .filter((d) => protein === 'all' || d.protein === protein)
      .filter((d) => {
        switch (filter) {
          case 'fav':
            return prefs[d.id] === 'like'
          case 'everyday':
            return isEveryday(d)
          case 'occasional':
            return !isEveryday(d)
          case 'iron':
            return d.tags.includes('high-iron')
          case 'protein':
            return d.protein_g >= 25
          case 'quick':
            return d.time_min <= 25
          case 'kid':
            return d.kidFriendly
          default:
            return true
        }
      })
      .filter((d) => !needle || d.name.toLowerCase().includes(needle) || (d.localName ?? '').toLowerCase().includes(needle) || d.description.toLowerCase().includes(needle) || d.ingredients.some((i) => i.name.includes(needle)))
      .sort((a, b) => (prefs[b.id] === 'like' ? 1 : 0) - (prefs[a.id] === 'like' ? 1 : 0) || (isEveryday(b) ? 1 : 0) - (isEveryday(a) ? 1 : 0) || a.name.localeCompare(b.name))
  }, [dishes, q, slot, protein, filter, prefs])

  const favCount = Object.values(prefs).filter((p) => p === 'like').length
  const disliked = Object.values(prefs).filter((p) => p === 'dislike').length

  return (
    <>
      <header className="top">
        <div>
          <div className="eyebrow">
            {dishes.length} dishes · {favCount} favourites{disliked ? ` · ${disliked} marked not for us` : ''}
          </div>
          <h1 className="h1">Recipes</h1>
        </div>
      </header>

      <div className="search">
        <IconSearch size={18} />
        <input placeholder="Search dishes or ingredients…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="seg">
        {SLOTS.map((s) => (
          <button key={s} className={slot === s ? 'active' : ''} onClick={() => setSlot(s)}>
            {s === 'any' ? 'All' : SLOT_LABEL[s]}
          </button>
        ))}
      </div>

      <div className="filter-row">
        {(['all', 'veg', 'egg', 'chicken', 'fish', 'prawn', 'lamb'] as const).map((p) => (
          <button key={p} className={'pill' + (protein === p ? ' active' : '')} onClick={() => setProtein(p)}>
            {p === 'all' ? 'Any protein' : PROTEIN_LABEL[p]}
          </button>
        ))}
      </div>
      <div className="filter-row">
        {(
          [
            ['all', 'Everything'],
            ['fav', '♥ Favourites'],
            ['everyday', 'Everyday'],
            ['occasional', 'Occasional'],
            ['iron', 'High iron'],
            ['protein', 'High protein'],
            ['quick', 'Under 25 min'],
            ['kid', 'Kid friendly']
          ] as [Filter, string][]
        ).map(([f, label]) => (
          <button key={f} className={'pill' + (filter === f ? ' active' : '')} onClick={() => setFilter(f)}>
            {label}
          </button>
        ))}
      </div>

      <ul className="swap-list">
        {list.map((d) => (
          <li key={d.id}>
            <button className={`swap-item slot-${d.slots[0]}`} onClick={() => setOpen(d)}>
              <span className="meal-ico" aria-hidden>
                {dishEmoji(d, d.slots[0])}
              </span>
              <span className="grow">
                <div className="swap-name">
                  {prefs[d.id] === 'like' && <IconHeart size={12} filled style={{ display: 'inline', verticalAlign: '-1px', marginRight: 4, color: 'var(--tomato)' }} />}
                  {d.name}
                </div>
                <div className="chips">
                  <span className={`chip chip-${d.protein}`}>{PROTEIN_LABEL[d.protein]}</span>
                  <span className="chip">{CUISINE_LABEL[d.cuisine]}</span>
                  {!isEveryday(d) && <span className="chip">Occasional</span>}
                  {isFeast(d) && <span className="chip feast-tag">Feast</span>}
                  {prefs[d.id] === 'dislike' && <span className="chip">Not for us</span>}
                </div>
              </span>
              <span className="swap-nutri">
                <b>{d.kcal}</b> kcal
                <br />
                {d.protein_g}g P · {d.iron_mg}mg Fe
                <br />
                <span className="faint">{d.time_min} min</span>
              </span>
            </button>
          </li>
        ))}
        {list.length === 0 && <li className="muted">Nothing matches.</li>}
      </ul>

      {open && <RecipeSheet dish={open} slot={open.slots.includes('lunch') ? 'lunch' : open.slots[0]} onClose={() => setOpen(null)} />}
    </>
  )
}
