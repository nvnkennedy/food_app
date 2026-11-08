// Small deterministic PRNG so two phones generate the identical plan from the same seed.

export function hashString(s: string): number {
  let h = 1779033703 ^ s.length
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507)
  h = Math.imul(h ^ (h >>> 13), 3266489909)
  return (h ^= h >>> 16) >>> 0
}

export interface Rng {
  next(): number // [0,1)
  int(maxExclusive: number): number
  pick<T>(arr: T[]): T
  shuffle<T>(arr: T[]): T[]
  weighted<T>(items: T[], weight: (t: T) => number): T
}

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const rng: Rng = {
    next,
    int: (m) => Math.floor(next() * m),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    shuffle: (arr) => {
      const out = arr.slice()
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        ;[out[i], out[j]] = [out[j], out[i]]
      }
      return out
    },
    weighted: (items, weight) => {
      const weights = items.map((it) => Math.max(0, weight(it)))
      const total = weights.reduce((a, b) => a + b, 0)
      if (total <= 0) return items[Math.floor(next() * items.length)]
      let r = next() * total
      for (let i = 0; i < items.length; i++) {
        r -= weights[i]
        if (r <= 0) return items[i]
      }
      return items[items.length - 1]
    }
  }
  return rng
}

export function rngFor(key: string): Rng {
  return mulberry32(hashString(key))
}
