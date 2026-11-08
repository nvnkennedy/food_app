import type { WeightEntry } from '../state'
import { fromISO } from '../lib/dates'

export function WeightChart({ entries, goal }: { entries: WeightEntry[]; goal: number }) {
  if (entries.length === 0) return <div className="muted small">Log your weight once a week to see the trend here.</div>
  const W = 320
  const H = 140
  const pad = { l: 34, r: 10, t: 10, b: 22 }
  const xs = entries.map((e) => fromISO(e.date).getTime())
  const ys = entries.map((e) => e.kg)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs, minX + 7 * 86400000)
  const minY = Math.floor(Math.min(...ys, goal) - 1)
  const maxY = Math.ceil(Math.max(...ys) + 1)
  const x = (t: number) => pad.l + ((t - minX) / (maxX - minX)) * (W - pad.l - pad.r)
  const y = (v: number) => pad.t + (1 - (v - minY) / (maxY - minY)) * (H - pad.t - pad.b)
  const path = entries.map((e, i) => `${i ? 'L' : 'M'}${x(fromISO(e.date).getTime()).toFixed(1)},${y(e.kg).toFixed(1)}`).join(' ')
  const ticks = [minY, Math.round((minY + maxY) / 2), maxY]
  const first = entries[0]
  const last = entries[entries.length - 1]
  const delta = last.kg - first.kg

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Weight trend">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="grid" />
            <text x={pad.l - 6} y={y(t) + 4} className="tick" textAnchor="end">
              {t}
            </text>
          </g>
        ))}
        <line x1={pad.l} x2={W - pad.r} y1={y(goal)} y2={y(goal)} className="goal" />
        <text x={W - pad.r} y={y(goal) - 4} className="tick goal-text" textAnchor="end">
          goal {goal} kg
        </text>
        <path d={path} className="line" />
        {entries.map((e) => (
          <circle key={e.date} cx={x(fromISO(e.date).getTime())} cy={y(e.kg)} r={3.5} className="dot" />
        ))}
      </svg>
      <div className="small">
        {entries.length > 1 ? (
          <>
            <b className={delta <= 0 ? 'good' : 'bad'}>
              {delta > 0 ? '+' : ''}
              {delta.toFixed(1)} kg
            </b>{' '}
            since {first.date} · latest {last.kg} kg
          </>
        ) : (
          <>Latest {last.kg} kg on {last.date}</>
        )}
      </div>
    </div>
  )
}
