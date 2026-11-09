import { useState } from 'react'
import { useFamily, CHILD, type Theme } from '../state'
import { ACTIVITY_LABEL, bmiOf, bmiBand, defaultProfile, type Activity, type Profile, type Sex } from '../lib/nutrition'
import { WeightChart } from '../components/WeightChart'
import { IconPlus, IconTrash } from '../components/Icons'
import { todayISO } from '../lib/dates'

export function Me() {
  const { profiles, setProfiles, people, childEnabled, setChildEnabled, weights, logWeight, removeWeight, clearOverrides, overrides, theme, setTheme } = useFamily()

  const add = (sex: Sex) => {
    const id = 'p' + Date.now().toString(36)
    const name = sex === 'male' ? 'Me' : 'Partner'
    setProfiles((p) => [...p, defaultProfile(id, name, sex)])
  }
  const update = (id: string, patch: Partial<Profile>) => setProfiles((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  const remove = (id: string) => {
    if (confirm('Remove this profile and its weight log from this phone?')) setProfiles((p) => p.filter((x) => x.id !== id))
  }

  const overrideCount = Object.values(overrides).reduce((s, d) => s + Object.keys(d).length, 0)

  return (
    <>
      <header className="top">
        <div>
          <div className="eyebrow">Profiles &amp; settings</div>
          <h1 className="h1">Me &amp; family</h1>
        </div>
      </header>

      {people.length === 0 && (
        <div className="card cta">
          <span className="emoji" aria-hidden>
            👋
          </span>
          <div className="grow">
            <div className="h3">Add the two adults</div>
            <div className="muted small">You get a daily calorie target with a gentle deficit, about half a kilo a week, and every plate sized for each of you.</div>
          </div>
        </div>
      )}

      {people.map(({ profile: p, targets }, i) => {
        const bmi = bmiOf(p)
        const log = weights[p.id] ?? []
        const toGo = p.weightKg - p.goalWeightKg
        return (
          <section key={p.id} className="card col" style={{ gap: 14 }}>
            <div className="profile-head">
              <span className={'avatar lg' + (i === 1 ? ' a2' : '')}>{p.name.slice(0, 1).toUpperCase()}</span>
              <input className="name-input grow" value={p.name} onChange={(e) => update(p.id, { name: e.target.value })} aria-label="Name" />
              <button className="icon-btn ghost sm danger" onClick={() => remove(p.id)} aria-label="Remove profile">
                <IconTrash size={16} />
              </button>
            </div>

            <div className="form-grid">
              <label className="field">
                Sex
                <select value={p.sex} onChange={(e) => update(p.id, { sex: e.target.value as Sex })}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </label>
              <label className="field">
                Age
                <input type="number" inputMode="numeric" value={p.age} onChange={(e) => update(p.id, { age: +e.target.value })} />
              </label>
              <label className="field">
                Height (cm)
                <input type="number" inputMode="numeric" value={p.heightCm} onChange={(e) => update(p.id, { heightCm: +e.target.value })} />
              </label>
              <label className="field">
                Weight (kg)
                <input type="number" inputMode="decimal" step="0.1" value={p.weightKg} onChange={(e) => update(p.id, { weightKg: +e.target.value })} />
              </label>
              <label className="field">
                Goal (kg)
                <input type="number" inputMode="decimal" step="0.1" value={p.goalWeightKg} onChange={(e) => update(p.id, { goalWeightKg: +e.target.value })} />
              </label>
              <label className="field span2">
                Activity
                <select value={p.activity} onChange={(e) => update(p.id, { activity: e.target.value as Activity })}>
                  {(Object.keys(ACTIVITY_LABEL) as Activity[]).map((a) => (
                    <option key={a} value={a}>
                      {ACTIVITY_LABEL[a]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="tiles">
              <div className="tile accent">
                <b>{targets.kcal}</b>
                <span>kcal per day target</span>
              </div>
              <div className="tile">
                <b>{toGo > 0 ? `${toGo.toFixed(1)} kg` : '🎉'}</b>
                <span>{toGo > 0 ? `to goal · BMI ${bmi.toFixed(1)} ${bmiBand(bmi)}` : 'goal reached'}</span>
              </div>
            </div>
            <div className="card-title" style={{ marginBottom: 0 }}>
              Daily nutrient targets
            </div>
            <div className="targets-row">
              <div>
                <b>{targets.protein_g} g</b>
                <span>protein</span>
              </div>
              <div>
                <b>{targets.fiber_g} g</b>
                <span>fibre</span>
              </div>
              <div>
                <b>{targets.iron_mg} mg</b>
                <span>iron</span>
              </div>
              <div>
                <b>{targets.zinc_mg} mg</b>
                <span>zinc</span>
              </div>
              <div>
                <b>{targets.magnesium_mg} mg</b>
                <span>magnesium</span>
              </div>
            </div>
            <div className="muted xs">
              You burn about {targets.tdee} kcal a day. Target is {targets.deficit} kcal below that, never under a safe floor.
            </div>

            <div>
              <div className="card-title">Weight log</div>
              <WeightLogger onLog={(kg) => logWeight(p.id, todayISO(), kg)} />
              <WeightChart entries={log} goal={p.goalWeightKg} />
              {log.length > 0 && (
                <details className="small" style={{ marginTop: 6 }}>
                  <summary>All entries ({log.length})</summary>
                  <ul className="list">
                    {[...log].reverse().map((w) => (
                      <li key={w.date} className="row-between">
                        <span>
                          {w.date} · <b>{w.kg} kg</b>
                        </span>
                        <button className="link danger" onClick={() => removeWeight(p.id, w.date)}>
                          delete
                        </button>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </section>
        )
      })}

      {profiles.length < 2 && (
        <div className="row">
          <button className="btn grow" onClick={() => add('male')}>
            <IconPlus size={16} /> Add adult (male)
          </button>
          <button className="btn grow" onClick={() => add('female')}>
            <IconPlus size={16} /> Add adult (female)
          </button>
        </div>
      )}

      <section className="card">
        <div className="card-title">Settings</div>
        <div className="setting">
          <div>
            <div className="t">Our 6-year-old eats with us</div>
            <div className="s">Shows his plate on every meal, his nutrient totals, and adds about {CHILD.factor}× of an adult serving to the grocery list.</div>
          </div>
          <label className="switch">
            <input type="checkbox" checked={childEnabled} onChange={(e) => setChildEnabled(e.target.checked)} />
            <span />
          </label>
        </div>
        <div className="setting" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <div className="t">Appearance</div>
          <div className="seg">
            {(['light', 'dark', 'system'] as Theme[]).map((t) => (
              <button key={t} className={theme === t ? 'active' : ''} onClick={() => setTheme(t)}>
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {overrideCount > 0 && (
          <div className="setting">
            <div>
              <div className="t">Swapped meals</div>
              <div className="s">
                {overrideCount} meal{overrideCount > 1 ? 's' : ''} changed from the plan on this phone.
              </div>
            </div>
            <button className="link danger" onClick={() => confirm('Remove all your swaps and go back to the generated plan?') && clearOverrides()}>
              Reset
            </button>
          </div>
        )}
      </section>

      <section className="card">
        <div className="card-title">How the plan works</div>
        <ul className="bullets">
          <li>Mostly South Indian home food, with North Indian and light high-protein plates for variety. No pasta.</li>
          <li>Each week: chicken 3×, fish 2×, egg 3×, the rest dal and vegetables. Prawns every second week. Lamb once every two months, on a weekend.</li>
          <li>Breakfast is tiffin: idli, dosa, poha, upma, ragi, oats, with eggs about twice a week. Snacks are South Indian and kid friendly.</li>
          <li>Iron-rich plates are favoured, and every recipe says how to absorb more: lemon or tomato with dal and greens, dal with rice or roti for complete protein, soaked and fermented batters, no tea or coffee with meals.</li>
          <li>Targets: protein 1.6 g per kg of goal weight, fibre 14 g per 1000 kcal, iron 18 mg (women) / 8 mg (men), zinc 8 / 11 mg, magnesium 310 / 420 mg. The little one: 1400 kcal, 24 g protein, 10 mg iron, 5 mg zinc, 130 mg magnesium.</li>
          <li>The plan is generated from the month, so both phones show the same meals without any account.</li>
          <li>Swap any meal from the Today screen when you feel like something else or have leftovers.</li>
        </ul>
      </section>

      <section className="card">
        <div className="card-title">Install on your phone</div>
        <ul className="bullets">
          <li>
            <span>
              <b>Android (Chrome):</b> menu ⋮ → Add to Home screen → Install.
            </span>
          </li>
          <li>
            <span>
              <b>iPhone (Safari):</b> Share → Add to Home Screen.
            </span>
          </li>
        </ul>
        <div className="faint xs" style={{ marginTop: 10 }}>
          Works offline after the first open · Virundhu v{__APP_VERSION__}
        </div>
      </section>
    </>
  )
}

function WeightLogger({ onLog }: { onLog: (kg: number) => void }) {
  const [v, setV] = useState('')
  return (
    <form
      className="row"
      style={{ marginBottom: 8 }}
      onSubmit={(e) => {
        e.preventDefault()
        const n = parseFloat(v.replace(',', '.'))
        if (n > 20 && n < 300) {
          onLog(Math.round(n * 10) / 10)
          setV('')
        }
      }}
    >
      <input className="input grow" type="number" inputMode="decimal" step="0.1" placeholder="Today's weight, kg" value={v} onChange={(e) => setV(e.target.value)} />
      <button className="btn" type="submit">
        Log
      </button>
    </form>
  )
}
