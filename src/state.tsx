import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { Dish, Slot } from './data/types'
import { DISHES, DISH_BY_ID } from './data'
import { useStored } from './lib/storage'
import { targetsOf, portionFactor, CHILD_FACTOR, CHILD_KCAL, type Profile, type Targets } from './lib/nutrition'
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
}

interface FamilyState {
  dishes: Dish[]
  byId: Map<string, Dish>
  profiles: Profile[]
  setProfiles: (v: Profile[] | ((p: Profile[]) => Profile[])) => void
  people: Person[]
  childEnabled: boolean
  setChildEnabled: (v: boolean) => void
  /** total adult-serving multiplier for the whole family (for grocery + ingredient scaling) */
  familyFactor: number
  overrides: Overrides
  setOverride: (date: ISODate, slot: Slot, dishId: string | null) => void
  clearOverrides: () => void
  weights: Record<string, WeightEntry[]>
  logWeight: (profileId: string, date: ISODate, kg: number) => void
  removeWeight: (profileId: string, date: ISODate) => void
  theme: Theme
  setTheme: (t: Theme) => void
  mealsOn: (date: ISODate) => Meals
  portionFor: (dish: Dish, slot: Slot, person: Person) => number
}

const Ctx = createContext<FamilyState | null>(null)

/** Standard adult serving in this app corresponds to roughly this many kcal per day. */
const STANDARD_DAY_KCAL = 1900

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useStored<Profile[]>('profiles', [])
  const [childEnabled, setChildEnabled] = useStored<boolean>('child', true)
  const [overrides, setOverrides] = useStored<Overrides>('overrides', {})
  const [weights, setWeights] = useStored<Record<string, WeightEntry[]>>('weights', {})
  const [theme, setTheme] = useStored<Theme>('theme', 'light')

  const people = useMemo<Person[]>(
    () =>
      profiles.map((profile) => {
        const targets = targetsOf(profile)
        const factor = Math.round(Math.min(1.2, Math.max(0.65, targets.kcal / STANDARD_DAY_KCAL)) * 20) / 20
        return { profile, targets, factor }
      }),
    [profiles]
  )

  const familyFactor = useMemo(() => {
    const adults = people.length ? people.reduce((s, p) => s + p.factor, 0) : 2 * 0.9
    return Math.round((adults + (childEnabled ? CHILD_FACTOR : 0)) * 100) / 100
  }, [people, childEnabled])

  const value: FamilyState = {
    dishes: DISHES,
    byId: DISH_BY_ID,
    profiles,
    setProfiles,
    people,
    childEnabled,
    setChildEnabled,
    familyFactor,
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
    theme,
    setTheme,
    mealsOn: (date) => mealsFor(date, DISHES, overrides),
    portionFor: (dish, slot, person) => portionFactor(dish, person.targets.kcal, slot)
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useFamily(): FamilyState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useFamily outside provider')
  return v
}

export const CHILD = { kcal: CHILD_KCAL, factor: CHILD_FACTOR }
