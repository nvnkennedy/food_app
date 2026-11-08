export type ISODate = string // YYYY-MM-DD

export function toISO(d: Date): ISODate {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromISO(s: ISODate): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayISO(): ISODate {
  return toISO(new Date())
}

export function addDays(s: ISODate, n: number): ISODate {
  const d = fromISO(s)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

export function daysInMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate()
}

/** Monday of the week containing the date. */
export function weekStart(s: ISODate): ISODate {
  const d = fromISO(s)
  const dow = (d.getDay() + 6) % 7 // Mon=0
  d.setDate(d.getDate() - dow)
  return toISO(d)
}

export function isWeekend(s: ISODate): boolean {
  const dow = fromISO(s).getDay()
  return dow === 0 || dow === 6
}

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MON_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function fmtShort(s: ISODate): string {
  const d = fromISO(s)
  return `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`
}

export function fmtDow(s: ISODate): string {
  return DOW[fromISO(s).getDay()]
}

export function fmtMonth(year: number, month0: number): string {
  return `${MON_LONG[month0]} ${year}`
}

export function fmtDayNum(s: ISODate): number {
  return fromISO(s).getDate()
}
