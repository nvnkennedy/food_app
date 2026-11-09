import { useState } from 'react'
import { useFamily, type Theme } from '../state'
import { ACTIVITY_LABEL, bmiOf, bmiBand, defaultProfile, type Activity, type Profile, type Sex } from '../lib/nutrition'
import { WeightChart } from '../components/WeightChart'
import { IconPlus, IconShare, IconTrash } from '../components/Icons'
import { todayISO } from '../lib/dates'
import { CURRENCY, type Region } from '../data/prices'

export function Me() {
  const { profiles, setProfiles, people, weights, logWeight, removeWeight, clearOverrides, overrides, settings, setSettings, setupLink, prefs, setPref, byId } = useFamily()
  const [copied, setCopied] = useState(false)
  const dislikedIds = Object.keys(prefs).filter((k) => prefs[k] === 'dislike')
  const adults = profiles.filter((p) => p.kind === 'adult').length
  const kids = profiles.filter((p) => p.kind === 'child').length

  const add = (kind: 'adult' | 'child', sex: Sex) => {
    const id = (kind === 'child' ? 'k' : 'p') + Date.now().toString(36)
    const name = kind === 'child' ? 'Child' : sex === 'male' ? 'Me' : 'Partner'
    setProfiles((p) => [...p, defaultProfile(id, name, sex, kind, kind === 'child' ? 6 : undefined)])
  }
  const update = (id: string, patch: Partial<Profile>) => setProfiles((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  const remove = (id: string) => {
    if (confirm('Remove this profile and its weight log from this phone?')) setProfiles((p) => p.filter((x) => x.id !== id))
  }

  const overrideCount = Object.values(overrides).reduce((s, d) => s + Object.keys(d).length, 0)
  const cur = CURRENCY[settings.region]

  return (
    <>
      <header className="top">
        <div>
          <div className="eyebrow">Profiles &amp; settings</div>
          <h1 className="h1">Family</h1>
        </div>
      </header>

      {people.map(({ profile: p, targets, cls, factor }) => {
        const isChild = p.kind === 'child'
        const bmi = bmiOf(p)
        const log = weights[p.id] ?? []
        const toGo = p.weightKg - p.goalWeightKg
        return (
          <section key={p.id} className="card col" style={{ gap: 14 }}>
            <div className="profile-head">
              <span className={'avatar lg ' + cls}>{p.name.slice(0, 1).toUpperCase()}</span>
              <div className="grow">
                <input className="name-input" value={p.name} onChange={(e) => update(p.id, { name: e.target.value })} aria-label="Name" placeholder="Name" />
                <div className="faint xs">{isChild ? `Child · age ${p.age}` : 'Adult'}</div>
              </div>
              <button className="icon-btn ghost sm danger" onClick={() => remove(p.id)} aria-label="Remove profile">
                <IconTrash size={16} />
              </button>
            </div>

            <div className="form-grid">
              <label className="field">
                {isChild ? 'Boy / girl' : 'Sex'}
                <select value={p.sex} onChange={(e) => update(p.id, { sex: e.target.value as Sex })}>
                  <option value="male">{isChild ? 'Boy' : 'Male'}</option>
                  <option value="female">{isChild ? 'Girl' : 'Female'}</option>
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
              {!isChild && (
                <>
                  <label className="field">
                    Goal (kg)
                    <input type="number" inputMode="decimal" step="0.1" value={p.goalWeightKg} onChange={(e) => update(p.id, { goalWeightKg: +e.target.value })} />
                  </label>
                  <label className="field">
                    Activity
                    <select value={p.activity} onChange={(e) => update(p.id, { activity: e.target.value as Activity })}>
                      {(Object.keys(ACTIVITY_LABEL) as Activity[]).map((a) => (
                        <option key={a} value={a}>
                          {ACTIVITY_LABEL[a]}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              )}
            </div>

            {isChild ? (
              <div className="tiles">
                <div className="tile accent">
                  <b>{targets.kcal}</b>
                  <span>kcal per day, eats to appetite</span>
                </div>
                <div className="tile">
                  <b>{Math.round(factor * 100)}%</b>
                  <span>of an adult plate</span>
                </div>
              </div>
            ) : (
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
            )}
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
            {!isChild && (
              <div className="muted xs">
                You burn about {targets.tdee} kcal a day. Target is {targets.deficit} kcal below that, never under a safe floor.
              </div>
            )}

            {!isChild && (
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
            )}
          </section>
        )
      })}

      <div className="row" style={{ flexWrap: 'wrap' }}>
        {adults < 2 && (
          <>
            <button className="btn sm grow" onClick={() => add('adult', 'male')}>
              <IconPlus size={16} /> Add adult (male)
            </button>
            <button className="btn sm grow" onClick={() => add('adult', 'female')}>
              <IconPlus size={16} /> Add adult (female)
            </button>
          </>
        )}
        {kids < 3 && (
          <button className="btn sm secondary grow" onClick={() => add('child', 'male')}>
            <IconPlus size={16} /> Add child
          </button>
        )}
      </div>

      <section className="card">
        <div className="card-title">Food preferences</div>
        <div className="setting">
          <div className="grow">
            <div className="t">Occasional dishes on weekends</div>
            <div className="s">Off: only familiar everyday Tamil home food is planned. On: North Indian plates, soups and salads can appear on weekends. Keep it the same on both phones so the plan matches.</div>
          </div>
          <label className="switch">
            <input type="checkbox" checked={settings.adventurous} onChange={(e) => setSettings({ adventurous: e.target.checked })} />
            <span />
          </label>
        </div>
        {settings.feastDays.length > 0 && (
          <div className="setting" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
            <div className="t">Your feast days ({settings.feastDays.length})</div>
            <div className="chips">
              {settings.feastDays.map((d) => (
                <button key={d} className="chip" onClick={() => setSettings({ feastDays: settings.feastDays.filter((x) => x !== d) })} title="Remove">
                  🎉 {d} ✕
                </button>
              ))}
            </div>
            <div className="s">Mark any day as a feast from the Today screen. The regular feast is the second Sunday of each month.</div>
          </div>
        )}
        {dislikedIds.length > 0 && (
          <div className="setting" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
            <div className="t">Not for us ({dislikedIds.length})</div>
            <div className="chips">
              {dislikedIds.map((id) => (
                <button key={id} className="chip" onClick={() => setPref(id, null)} title="Allow again">
                  {byId.get(id)?.name.split(' (')[0] ?? id} ✕
                </button>
              ))}
            </div>
            <div className="s">Tap to allow a dish again. Mark dishes from any recipe page.</div>
          </div>
        )}
      </section>

      <section className="card">
        <div className="card-title">Share setup with the other phone</div>
        <div className="s" style={{ marginBottom: 10 }}>
          Sends names, ages, targets, country and budget. Open the link on the other phone once; its weight log and swaps stay separate.
        </div>
        <button
          className="btn sm secondary"
          onClick={async () => {
            const url = setupLink()
            try {
              if (navigator.share) await navigator.share({ title: 'Virundhu family setup', url })
              else {
                await navigator.clipboard.writeText(url)
                setCopied(true)
                setTimeout(() => setCopied(false), 2500)
              }
            } catch {
              try {
                await navigator.clipboard.writeText(url)
                setCopied(true)
                setTimeout(() => setCopied(false), 2500)
              } catch {
                /* ignore */
              }
            }
          }}
        >
          <IconShare size={16} /> {copied ? 'Link copied' : 'Share setup link'}
        </button>
      </section>

      <section className="card">
        <div className="card-title">Shopping &amp; budget</div>
        <div className="setting" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <div className="t">Country</div>
          <div className="seg">
            {(['DE', 'IN'] as Region[]).map((r) => (
              <button key={r} className={settings.region === r ? 'active' : ''} onClick={() => setSettings({ region: r, weeklyBudget: settings.region === r ? settings.weeklyBudget : r === 'DE' ? 90 : 3500 })}>
                {r === 'DE' ? 'Germany · €' : 'India · ₹'}
              </button>
            ))}
          </div>
          <div className="s">{settings.region === 'DE' ? 'Supermarket and Indian store lists, German / Aldi names, euro prices.' : 'One shopping list, rupee prices, no German names.'}</div>
        </div>
        <div className="setting">
          <div className="grow">
            <div className="t">Weekly grocery budget</div>
            <div className="s">The plan is built to fit this: expensive meals are swapped for cheaper familiar ones before you see them. Feast weeks may go over.</div>
          </div>
          <div className="row" style={{ gap: 4 }}>
            <span className="muted">{cur.symbol}</span>
            <input className="input" style={{ width: 90, padding: '8px 10px' }} type="number" inputMode="decimal" value={settings.weeklyBudget || ''} placeholder="0" onChange={(e) => setSettings({ weeklyBudget: Math.max(0, parseFloat(e.target.value) || 0) })} />
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-title">App</div>
        <div className="setting" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <div className="t">Appearance</div>
          <div className="seg">
            {(['light', 'dark', 'system'] as Theme[]).map((t) => (
              <button key={t} className={settings.theme === t ? 'active' : ''} onClick={() => setSettings({ theme: t })}>
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
          <li>Only familiar everyday dishes are planned: idli, dosa, upma, pongal, sambar, rasam, kootu, poriyal, kuzhambu, curd rice, chicken and fish curries, egg curry. Less familiar dishes are marked "Occasional" and appear only if you pick them, or on weekends if you switch that on.</li>
          <li>Weekdays are South Indian home food. North Indian plates and light soups or salads can appear only on weekends, as extras.</li>
          <li>One feast a month, on the second Sunday: biryani or a celebration plate, and lamb in every second month. Add your own feast days (birthdays, festivals) from the Today screen.</li>
          <li>The week is planned to fit your grocery budget: the most expensive meals are replaced with cheaper familiar ones, keeping the same protein where possible.</li>
          <li>Each week: chicken 3×, fish 2×, egg 3×, the rest dal and vegetables. Prawns every second week.</li>
          <li>Breakfast is tiffin: idli, dosa, poha, upma, ragi, oats, with eggs about twice a week. Snacks are South Indian and kid friendly.</li>
          <li>Iron-rich plates are favoured and every recipe says how to absorb more: lemon or tomato with dal and greens, dal with rice or roti for complete protein, soaked and fermented batters, no tea or coffee with meals.</li>
          <li>The plan is generated from the month, so both phones show the same meals without any account. Swaps stay on the phone that made them.</li>
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
