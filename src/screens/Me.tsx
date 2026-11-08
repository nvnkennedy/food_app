import { useState } from 'react'
import { useFamily, CHILD } from '../state'
import { ACTIVITY_LABEL, bmiOf, bmiBand, defaultProfile, type Activity, type Profile, type Sex } from '../lib/nutrition'
import { WeightChart } from '../components/WeightChart'
import { todayISO } from '../lib/dates'

export function Me() {
  const { profiles, setProfiles, people, childEnabled, setChildEnabled, weights, logWeight, removeWeight, clearOverrides, overrides } = useFamily()

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
        <div className="brand">Me &amp; family</div>
      </header>

      {people.length === 0 && (
        <div className="card hint">
          Add the two adults. The app computes a daily calorie target with a gentle deficit (about half a kilo a week) and sizes every plate for each of you.
        </div>
      )}

      {people.map(({ profile: p, targets }) => {
        const bmi = bmiOf(p)
        const log = weights[p.id] ?? []
        return (
          <section key={p.id} className="card profile">
            <div className="row-between">
              <input className="name-input" value={p.name} onChange={(e) => update(p.id, { name: e.target.value })} aria-label="Name" />
              <button className="link-btn danger" onClick={() => remove(p.id)}>
                Remove
              </button>
            </div>
            <div className="form-grid">
              <label>
                Sex
                <select value={p.sex} onChange={(e) => update(p.id, { sex: e.target.value as Sex })}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </label>
              <label>
                Age
                <input type="number" inputMode="numeric" value={p.age} onChange={(e) => update(p.id, { age: +e.target.value })} />
              </label>
              <label>
                Height cm
                <input type="number" inputMode="numeric" value={p.heightCm} onChange={(e) => update(p.id, { heightCm: +e.target.value })} />
              </label>
              <label>
                Weight kg
                <input type="number" inputMode="decimal" step="0.1" value={p.weightKg} onChange={(e) => update(p.id, { weightKg: +e.target.value })} />
              </label>
              <label>
                Goal kg
                <input type="number" inputMode="decimal" step="0.1" value={p.goalWeightKg} onChange={(e) => update(p.id, { goalWeightKg: +e.target.value })} />
              </label>
              <label className="span2">
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

            <div className="targets">
              <div>
                <b>{targets.kcal}</b>
                <span>kcal / day target</span>
              </div>
              <div>
                <b>{targets.protein_g} g</b>
                <span>protein / day</span>
              </div>
              <div>
                <b>{bmi.toFixed(1)}</b>
                <span>BMI · {bmiBand(bmi)}</span>
              </div>
              <div>
                <b>{targets.tdee}</b>
                <span>kcal you burn / day</span>
              </div>
            </div>
            <div className="muted small">
              Target = what you burn minus {targets.deficit} kcal, never below a safe floor. {p.weightKg - p.goalWeightKg > 0 ? `${(p.weightKg - p.goalWeightKg).toFixed(1)} kg to go.` : 'Goal reached — maintain!'}
            </div>

            <WeightLogger onLog={(kg) => logWeight(p.id, todayISO(), kg)} />
            <WeightChart entries={log} goal={p.goalWeightKg} />
            {log.length > 0 && (
              <details className="small">
                <summary>Weight entries ({log.length})</summary>
                <ul className="plain">
                  {[...log].reverse().map((w) => (
                    <li key={w.date} className="row-between">
                      <span>
                        {w.date} · {w.kg} kg
                      </span>
                      <button className="link-btn danger" onClick={() => removeWeight(p.id, w.date)}>
                        delete
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </section>
        )
      })}

      {profiles.length < 2 && (
        <div className="row-gap pad">
          <button className="btn" onClick={() => add('male')}>
            + Add adult (male)
          </button>
          <button className="btn" onClick={() => add('female')}>
            + Add adult (female)
          </button>
        </div>
      )}

      <section className="card">
        <label className="row-between">
          <span>
            <b>Our 6-year-old eats with us</b>
            <div className="muted small">Adds about {CHILD.factor}× of an adult serving to the grocery list and ingredient amounts.</div>
          </span>
          <input type="checkbox" checked={childEnabled} onChange={(e) => setChildEnabled(e.target.checked)} />
        </label>
      </section>

      <section className="card">
        <h4>How the plan works</h4>
        <ul className="plain small">
          <li>About 70% Indian (mostly South Indian), 30% pasta across lunches and dinners.</li>
          <li>Each week: chicken 3×, fish 2×, egg 3×, the rest veg. Prawns every second week. Lamb once every two months, on a weekend.</li>
          <li>Breakfast is tiffin: idly, dosa, poha, upma, oats, eggs about twice a week.</li>
          <li>The plan is generated from the month, so both phones show the same meals without any account.</li>
          <li>Swap any meal on the Today screen if you feel like something else or have leftovers.</li>
        </ul>
        {overrideCount > 0 && (
          <button className="link-btn danger" onClick={() => confirm('Remove all your swaps and go back to the generated plan?') && clearOverrides()}>
            Reset {overrideCount} swapped meal{overrideCount > 1 ? 's' : ''}
          </button>
        )}
      </section>

      <section className="card">
        <h4>Install on your phone</h4>
        <ul className="plain small">
          <li>
            <b>Android (Chrome):</b> menu ⋮ → <i>Add to Home screen</i> → Install.
          </li>
          <li>
            <b>iPhone (Safari):</b> Share □↑ → <i>Add to Home Screen</i>.
          </li>
        </ul>
        <div className="muted small">Works offline after the first open. v{__APP_VERSION__}</div>
      </section>
    </>
  )
}

function WeightLogger({ onLog }: { onLog: (kg: number) => void }) {
  const [v, setV] = useState('')
  return (
    <form
      className="row-gap"
      onSubmit={(e) => {
        e.preventDefault()
        const n = parseFloat(v.replace(',', '.'))
        if (n > 20 && n < 300) {
          onLog(Math.round(n * 10) / 10)
          setV('')
        }
      }}
    >
      <input className="input" type="number" inputMode="decimal" step="0.1" placeholder="Today's weight, kg" value={v} onChange={(e) => setV(e.target.value)} />
      <button className="btn" type="submit">
        Log
      </button>
    </form>
  )
}
