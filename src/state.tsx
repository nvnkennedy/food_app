import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { Dish, Slot } from './data/types'
import { DISHES, DISH_BY_ID } from './data'
import type { Region } from './data/prices'
import { loadJSON, useStored } from './lib/storage'
import { targetsOf, portionFactor, dayFactor, type Profile, type Targets } from './lib/nutrition'
import { mealsFor, type Overrides, type Meals } from './lib/planner'
import type { ISODate } from './lib/dates'

export interface WeightEntry {
  date: ISODate
  kg: number
}

export type Theme = 'light' | 'dark' | 'system'

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
}

const DEFAULT_SETTINGS: Settings = { region: 'DE', weeklyBudget: 0, theme: 'light', onboarded: false }

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
  overrides: Overrides
  setOverride: (date: ISODate, slot: Slot, dishId: string | null) => void
  clearOverrides: () => void
  weights: Record<string, WeightEntry[]>
  logWeight: (profileId: string, date: ISODate, kg: number) => void
  removeWeight: (profileId: string, date: ISODate) => void
  mealsOn: (date: ISODate) => Meals
  portionFor: (dish: Dish, slot: Slot, person: Person) => number
}

const Ctx = createContext<FamilyState | null>(null)

const AVATAR_CLASSES = ['', 'a2', 'a3', 'a4']

/** One-time migration from the earlier shape (profiles without kind, separate child toggle, theme key). */
function migrateProfiles(list: Profile[]): Profile[] {
  const out = list.map((p) => ({ ...p, kind: p.kind ?? 'adult' }) as Profile)
  const hadChild = loadJSON<boolean | null>('child', null)
  if (hadChild === true && !out.some((p) => p.kind === 'child')) {
    out.push({ id: 'kid', kind: 'child', name: 'Little one', sex: 'male', age: 6, heightCm: 121, weightKg: 25, goalWeightKg: 0, activity: 'moderate' })
  }
  return out
}

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [rawProfiles, setProfiles] = useStored<Profile[]>('profiles', [])
  const [overrides, setOverrides] = useStored<Overrides>('overrides', {})
  const [weights, setWeights] = useStored<Record<string, WeightEntry[]>>('weights', {})
  const [settings, setSettingsRaw] = useStored<Settings>('settings', { ...DEFAULT_SETTINGS, theme: loadJSON<Theme>('theme', 'light'), onboarded: loadJSON<Profile[]>('profiles', []).length > 0 })

  const profiles = useMemo(() => migrateProfiles(rawProfiles), [rawProfiles])

  const people = useMemo<Person[]>(() => {
    let ai = 0
    return profiles.map((profile) => {
      const targets = targetsOf(profile)
      const cls = profile.kind === 'child' ? 'kid' : AVATAR_CLASSES[ai++ % AVATAR_CLASSES.length]
      return { profile, targets, factor: dayFactor(profile, targets), cls }
    })
  }, [profiles])

  const adults = people.filter((p) => p.profile.kind === 'adult')
  const kids = people.filter((p) => p.profile.kind === 'child')

  const familyFactor = useMemo(() => {
    const sum = people.length ? people.reduce((s, p) => s + p.factor, 0) : 2 * 0.9 + 0.6
    return Math.round(sum * 100) / 100
  }, [people])

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
    setSettings: (patch) => setSettingsRaw((prev) => ({ ...prev, ...patch })),
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
    mealsOn: (date) => mealsFor(date, DISHES, overrides),
    portionFor: (dish, slot, person) => portionFactor(dish, person.profile, person.targets, slot)
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useFamily(): FamilyState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useFamily outside provider')
  return v
}
