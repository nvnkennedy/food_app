import { useState } from 'react'
import { useFamily } from '../state'
import { defaultProfile, type Kind, type Profile, type Sex } from '../lib/nutrition'
import type { Region } from '../data/prices'
import { CURRENCY } from '../data/prices'
import { IconPlus, IconTrash } from '../components/Icons'

interface Row {
  id: string
  kind: Kind
  name: string
  sex: Sex
  age: string
}

const newRow = (kind: Kind, sex: Sex): Row => ({ id: Math.random().toString(36).slice(2, 8), kind, name: '', sex, age: kind === 'child' ? '6' : '' })

/** First-run screen: who is eating (any number of adults and children), where you live, weekly budget. */
export function Welcome() {
  const { setProfiles, setSettings, settings } = useFamily()
  const [rows, setRows] = useState<Row[]>([newRow('adult', 'male'), newRow('adult', 'female'), newRow('child', 'male')])
  const [region, setRegion] = useState<Region>(settings.region)
  const [budget, setBudget] = useState(region === 'DE' ? '90' : '3500')

  const cur = CURRENCY[region]
  const named = rows.filter((r) => r.name.trim())
  const ok = named.length > 0

  const update = (id: string, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const remove = (id: string) => setRows((rs) => rs.filter((r) => r.id !== id))

  const save = () => {
    const list: Profile[] = named.map((r, i) => defaultProfile(`${r.kind === 'child' ? 'k' : 'p'}${i + 1}-${r.id}`, r.name.trim(), r.sex, r.kind, r.kind === 'child' ? Math.max(1, Math.min(17, parseInt(r.age) || 6)) : undefined))
    setProfiles(list)
    setSettings({ region, weeklyBudget: Math.max(0, parseFloat(budget) || 0), onboarded: true })
  }

  return (
    <div className="welcome">
      <div className="welcome-hero">
        <img src="./icons/icon.svg" alt="" width={72} height={72} />
        <div className="eyebrow">Platora</div>
        <h1 className="h1">Virundhu</h1>
        <p className="muted">Simple South Indian home food, planned for everyone at your table, with the protein, iron and fibre you need to lose weight well.</p>
      </div>

      <section className="card col" style={{ gap: 10 }}>
        <div className="card-title">Who is eating?</div>
        <div className="faint xs">Add everyone who eats from the same pot: adults, grandparents, children. Each person gets their own plate size and nutrient targets.</div>
        {rows.map((r) => (
          <div key={r.id} className="member-row">
            <span className={'avatar ' + (r.kind === 'child' ? 'kid' : '')}>{r.kind === 'child' ? 'C' : 'A'}</span>
            <input className="input grow" placeholder={r.kind === 'child' ? "Child's name" : 'Name'} value={r.name} onChange={(e) => update(r.id, { name: e.target.value })} aria-label="Name" />
            {r.kind === 'child' && <input className="input age" type="number" inputMode="numeric" min={1} max={17} value={r.age} onChange={(e) => update(r.id, { age: e.target.value })} aria-label="Age" title="Age" />}
            <select className="input sex" value={r.sex} onChange={(e) => update(r.id, { sex: e.target.value as Sex })} aria-label="Sex">
              <option value="male">{r.kind === 'child' ? 'Boy' : 'M'}</option>
              <option value="female">{r.kind === 'child' ? 'Girl' : 'F'}</option>
            </select>
            <button className="icon-btn ghost sm" onClick={() => remove(r.id)} aria-label="Remove" disabled={rows.length === 1}>
              <IconTrash size={15} />
            </button>
          </div>
        ))}
        <div className="row">
          <button className="btn sm secondary grow" onClick={() => setRows((rs) => [...rs, newRow('adult', 'male')])}>
            <IconPlus size={15} /> Adult
          </button>
          <button className="btn sm secondary grow" onClick={() => setRows((rs) => [...rs, newRow('child', 'male')])}>
            <IconPlus size={15} /> Child
          </button>
        </div>
        <div className="faint xs">Height, weight and goals can be filled in later under Family. Sensible defaults are used until then.</div>
      </section>

      <section className="card col" style={{ gap: 12 }}>
        <div className="card-title">Where do you shop?</div>
        <div className="seg">
          <button
            className={region === 'DE' ? 'active' : ''}
            onClick={() => {
              setRegion('DE')
              setBudget('90')
            }}
          >
            Germany · €
          </button>
          <button
            className={region === 'IN' ? 'active' : ''}
            onClick={() => {
              setRegion('IN')
              setBudget('3500')
            }}
          >
            India · ₹
          </button>
        </div>
        <div className="faint xs">{region === 'DE' ? 'Grocery list split into supermarket (Aldi, Lidl, Rewe) and Indian store, with German names and euro prices.' : 'One shopping list with rupee prices. Curd, paneer and fresh fish are easy to get, so they are used freely.'}</div>
        <label className="field">
          Weekly grocery budget ({cur.symbol})
          <input type="number" inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value)} />
        </label>
        <div className="faint xs">The week is planned to fit this amount. You can change it any time under Family or Grocery.</div>
      </section>

      <button className="btn wide" disabled={!ok} onClick={save}>
        Start planning{named.length ? ` for ${named.length} ${named.length === 1 ? 'person' : 'people'}` : ''}
      </button>
    </div>
  )
}
