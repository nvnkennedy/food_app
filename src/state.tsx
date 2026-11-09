import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { Dish, Slot } from './data/types'
import { DISHES, DISH_BY_ID } from './data'
import type { Region } from './data/prices'
import { loadJSON, useStored } from './lib/storage'
import { targetsOf, portionFactor, dayFactor, type Profile, type Targets } from './lib/nutrition'
import { mealsFor, applyDislikes, type Overrides, type Meals, type PlanOptions } from './lib/planner'
import type { ISODate } from './lib/dates'

export interface WeightEntry {
  date: ISODate
  kg: number
}

export type Theme = 'light' | 'dark' | 'system'
export type Pref = 'like' | 'dislike'

export interface Person {
  profile: Profile
  targets: Targets
  /** share of a standard adult serving this person eats on average */
  factor: number
  /** avatar colour class */
  cls: string
}

export interface Settings {
  region: Region
  /** weekly grocery budget in the region's currency; 0 = not set */
  weeklyBudget: number
  theme: Theme
  /** welcome screen completed */
  onboarded: boolean
  /** also offer occasional (less familiar) dishes on weekends */
  adventurous: boolean
  /** extra feast days chosen by the family */
  feastDays: ISODate[]
}

const DEFAULT_SETTINGS: Settings = { region: 'DE', weeklyBudget: 0, theme: 'light', onboarded: false, adventurous: false, feastDays: [] }

/** What a day looks like after swaps and dislikes. */
export interface DayMeals {
  meals: Meals
  /** slots replaced automatically because the planned dish is disliked */
  replaced: Slot[]
}

export type Eaten = Record<ISODate, Partial<Record<Slot, boolean>>>

interface FamilyState {
  dishes: Dish[]
  byId: Map<string, Dish>
  profiles: Profile[]
  setProfiles: (v: Profile[] | ((p: Profile[]) => Profile[])) => void
  people: Person[]
  adults: Person[]
  children: Person[]
  /** total adult-serving multiplier for the whole family (for grocery + ingredient scaling) */
  familyFactor: number
  settings: Settings
  setSettings: (patch: Partial<Settings>) => void
  toggleTheme: () => void
  toggleFeastDay: (date: ISODate) => void
  planOptions: PlanOptions
  overrides: Overrides
  setOverride: (date: ISODate, slot: Slot, dishId: string | null) => void
  clearOverrides: () => void
  weights: Record<string, WeightEntry[]>
  logWeight: (profileId: string, date: ISODate, kg: number) => void
  removeWeight: (profileId: string, date: ISODate) => void
  prefs: Record<string, Pref>
  setPref: (dishId: string, pref: Pref | null) => void
  eaten: Eaten
  setEaten: (date: ISODate, slot: Slot, on: boolean) => void
  mealsOn: (date: ISODate) => Meals
  dayOn: (date: ISODate) => DayMeals
  portionFor: (dish: Dish, slot: Slot, person: Person) => number
  /** export the family setup (profiles + settings) as a shareable URL */
  setupLink: () => string
  importSetup: (payload: SetupPayload) => void
}

export interface SetupPayload {
  v: 1
  profiles: Profile[]
  settings: Partial<Settings>
}

const Ctx = createContext<FamilyState | null>(null)

const AVATAR_CLASSES = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8']

/** One-time migration from the earlier shape (profiles without kind, separate child toggle, theme key). */
function migrateProfiles(list: Profile[]): Profile[] {
  const out = list.map((p) => ({ ...p, kind: p.kind ?? 'adult' }) as Profile)
  const hadChild = loadJSON<boolean | null>('child', null)
  if (hadChild === true && !out.some((p) => p.kind === 'child')) {
    out.push({ id: 'kid', kind: 'child', name: 'Little one', sex: 'male', age: 6, heightCm: 121, weightKg: 25, goalWeightKg: 0, activity: 'moderate' })
  }
  return out
}

export function encodeSetup(payload: SetupPayload): string {
  const json = JSON.stringify(payload)
  const b64 = btoa(unescape(encodeURIComponent(json)))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeSetup(s: string): SetupPayload | null {
  try {
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(escape(atob(b64)))
    const p = JSON.parse(json) as SetupPayload
    if (p && p.v === 1 && Array.isArray(p.profiles)) return p
  } catch {
    /* ignore */
  }
  return null
}

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [rawProfiles, setProfiles] = useStored<Profile[]>('profiles', [])
  const [overrides, setOverrides] = useStored<Overrides>('overrides', {})
  const [weights, setWeights] = useStored<Record<string, WeightEntry[]>>('weights', {})
  const [prefs, setPrefs] = useStored<Record<string, Pref>>('prefs', {})
  const [eaten, setEatenRaw] = useStored<Eaten>('eaten', {})
  const [settingsRaw, setSettingsRaw] = useStored<Settings>('settings', { ...DEFAULT_SETTINGS, theme: loadJSON<Theme>('theme', 'light'), onboarded: loadJSON<Profile[]>('profiles', []).length > 0 })
  const settings = useMemo<Settings>(() => ({ ...DEFAULT_SETTINGS, ...settingsRaw, feastDays: settingsRaw.feastDays ?? [] }), [settingsRaw])

  const profiles = useMemo(() => migrateProfiles(rawProfiles), [rawProfiles])

  const people = useMemo<Person[]>(() => {
    return profiles.map((profile, i) => {
      const targets = targetsOf(profile)
      const cls = AVATAR_CLASSES[i % AVATAR_CLASSES.length]
      return { profile, targets, factor: dayFactor(profile, targets), cls }
    })
  }, [profiles])

  const adults = people.filter((p) => p.profile.kind === 'adult')
  const kids = people.filter((p) => p.profile.kind === 'child')

  const familyFactor = useMemo(() => {
    const sum = people.length ? people.reduce((s, p) => s + p.factor, 0) : 2 * 0.9 + 0.6
    return Math.round(sum * 100) / 100
  }, [people])

  const planOptions = useMemo<PlanOptions>(
    () => ({ adventurous: settings.adventurous, budget: settings.weeklyBudget, region: settings.region, familyFactor, feastDays: [...settings.feastDays].sort() }),
    [settings.adventurous, settings.weeklyBudget, settings.region, settings.feastDays, familyFactor]
  )
  const disliked = useMemo(() => new Set(Object.keys(prefs).filter((k) => prefs[k] === 'dislike')), [prefs])

  const dayOn = (date: ISODate): DayMeals => {
    const base = mealsFor(date, DISHES, overrides, planOptions)
    return applyDislikes(date, base, DISHES, disliked, overrides[date] ?? {})
  }

  const setSettings = (patch: Partial<Settings>) => setSettingsRaw((prev) => ({ ...DEFAULT_SETTINGS, ...prev, ...patch }))

  const value: FamilyState = {
    dishes: DISHES,
    byId: DISH_BY_ID,
    profiles,
    setProfiles,
    people,
    adults,
    children: kids,
    familyFactor,
    settings,
    setSettings,
    toggleTheme: () => {
      const dark = document.documentElement.dataset.theme === 'dark'
      setSettings({ theme: dark ? 'light' : 'dark' })
    },
    toggleFeastDay: (date) => setSettings({ feastDays: settings.feastDays.includes(date) ? settings.feastDays.filter((d) => d !== date) : [...settings.feastDays, date].sort() }),
    planOptions,
    overrides,
    setOverride: (date, slot, dishId) =>
      setOverrides((prev) => {
        const next = { ...prev, [date]: { ...(prev[date] ?? {}) } }
        if (dishId) next[date][slot] = dishId
        else delete next[date][slot]
        if (Object.keys(next[date]).length === 0) delete next[date]
        return next
      }),
    clearOverrides: () => setOverrides({}),
    weights,
    logWeight: (pid, date, kg) =>
      setWeights((prev) => {
        const list = (prev[pid] ?? []).filter((w) => w.date !== date)
        list.push({ date, kg })
        list.sort((a, b) => a.date.localeCompare(b.date))
        return { ...prev, [pid]: list }
      }),
    removeWeight: (pid, date) => setWeights((prev) => ({ ...prev, [pid]: (prev[pid] ?? []).filter((w) => w.date !== date) })),
    prefs,
    setPref: (id, pref) =>
      setPrefs((prev) => {
        const next = { ...prev }
        if (pref) next[id] = pref
        else delete next[id]
        return next
      }),
    eaten,
    setEaten: (date, slot, on) =>
      setEatenRaw((prev) => {
        const next = { ...prev, [date]: { ...(prev[date] ?? {}) } }
        if (on) next[date][slot] = true
        else delete next[date][slot]
        if (Object.keys(next[date]).length === 0) delete next[date]
        return next
      }),
    mealsOn: (date) => dayOn(date).meals,
    dayOn,
    portionFor: (dish, slot, person) => portionFactor(dish, person.profile, person.targets, slot),
    setupLink: () => {
      const payload: SetupPayload = {
        v: 1,
        profiles,
        settings: { region: settings.region, weeklyBudget: settings.weeklyBudget, adventurous: settings.adventurous, feastDays: settings.feastDays }
      }
      const base = location.href.split('#')[0]
      return `${base}#setup=${encodeSetup(payload)}`
    },
    importSetup: (payload) => {
      setProfiles(payload.profiles)
      setSettingsRaw((prev) => ({ ...DEFAULT_SETTINGS, ...prev, ...payload.settings, onboarded: true }))
    }
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useFamily(): FamilyState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useFamily outside provider')
  return v
}
