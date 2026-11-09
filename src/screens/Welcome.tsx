import { useState } from 'react'
import { useFamily } from '../state'
import { defaultProfile, type Profile, type Sex } from '../lib/nutrition'
import type { Region } from '../data/prices'
import { CURRENCY } from '../data/prices'

/** First-run screen: who is eating, where you live, weekly budget. */
export function Welcome() {
  const { setProfiles, setSettings, settings } = useFamily()
  const [a1, setA1] = useState({ name: '', sex: 'male' as Sex })
  const [a2, setA2] = useState({ name: '', sex: 'female' as Sex })
  const [kid, setKid] = useState({ name: '', age: '6', sex: 'male' as Sex, on: true })
  const [region, setRegion] = useState<Region>(settings.region)
  const [budget, setBudget] = useState(region === 'DE' ? '90' : '3500')

  const cur = CURRENCY[region]
  const ok = a1.name.trim().length > 0

  const save = () => {
    const list: Profile[] = [defaultProfile('p1', a1.name.trim(), a1.sex)]
    if (a2.name.trim()) list.push(defaultProfile('p2', a2.name.trim(), a2.sex))
    if (kid.on && kid.name.trim()) list.push(defaultProfile('k1', kid.name.trim(), kid.sex, 'child', Math.max(1, Math.min(17, parseInt(kid.age) || 6))))
    setProfiles(list)
    setSettings({ region, weeklyBudget: Math.max(0, parseFloat(budget) || 0), onboarded: true })
  }

  return (
    <div className="welcome">
      <div className="welcome-hero">
        <img src="./icons/icon.svg" alt="" width={72} height={72} />
        <h1 className="h1">Virundhu</h1>
        <p className="muted">Simple South Indian home food, planned for the whole family, with the protein, iron and fibre you need to lose weight well.</p>
      </div>

      <section className="card col" style={{ gap: 12 }}>
        <div className="card-title">Who is eating?</div>
        <div className="row">
          <input className="input grow" placeholder="Your name" value={a1.name} onChange={(e) => setA1({ ...a1, name: e.target.value })} autoFocus />
          <select className="input" style={{ width: 110 }} value={a1.sex} onChange={(e) => setA1({ ...a1, sex: e.target.value as Sex })}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div className="row">
          <input className="input grow" placeholder="Partner's name (optional)" value={a2.name} onChange={(e) => setA2({ ...a2, name: e.target.value })} />
          <select className="input" style={{ width: 110 }} value={a2.sex} onChange={(e) => setA2({ ...a2, sex: e.target.value as Sex })}>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>
        <label className="setting" style={{ padding: '4px 0 0', border: 0 }}>
          <div>
            <div className="t">We have a child</div>
            <div className="s">Gets their own plate size and nutrient targets by age.</div>
          </div>
          <span className="switch">
            <input type="checkbox" checked={kid.on} onChange={(e) => setKid({ ...kid, on: e.target.checked })} />
            <span />
          </span>
        </label>
        {kid.on && (
          <div className="row">
            <input className="input grow" placeholder="Child's name" value={kid.name} onChange={(e) => setKid({ ...kid, name: e.target.value })} />
            <input className="input" style={{ width: 70 }} type="number" inputMode="numeric" min={1} max={17} value={kid.age} onChange={(e) => setKid({ ...kid, age: e.target.value })} aria-label="Child's age" />
            <select className="input" style={{ width: 90 }} value={kid.sex} onChange={(e) => setKid({ ...kid, sex: e.target.value as Sex })}>
              <option value="male">Boy</option>
              <option value="female">Girl</option>
            </select>
          </div>
        )}
        <div className="faint xs">Height, weight and goals can be filled in later under Me. Sensible defaults are used until then.</div>
      </section>

      <section className="card col" style={{ gap: 12 }}>
        <div className="card-title">Where do you shop?</div>
        <div className="seg">
          <button className={region === 'DE' ? 'active' : ''} onClick={() => { setRegion('DE'); setBudget('90') }}>
            Germany · €
          </button>
          <button className={region === 'IN' ? 'active' : ''} onClick={() => { setRegion('IN'); setBudget('3500') }}>
            India · ₹
          </button>
        </div>
        <div className="faint xs">{region === 'DE' ? 'Grocery list split into supermarket (Aldi, Lidl, Rewe) and Indian store, with German names and euro prices.' : 'One shopping list with rupee prices. Curd, paneer and fresh fish are easy to get, so they are used freely.'}</div>
        <label className="field">
          Weekly grocery budget ({cur.symbol})
          <input type="number" inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value)} />
        </label>
        <div className="faint xs">The grocery list shows the estimated cost of the week against this. You can change it any time under Me.</div>
      </section>

      <button className="btn wide" disabled={!ok} onClick={save}>
        Start planning
      </button>
    </div>
  )
}
