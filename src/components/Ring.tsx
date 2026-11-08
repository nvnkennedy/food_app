export function Ring({ value, max, label }: { value: number; max: number; label: string }) {
  const r = 26
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, max ? value / max : 0))
  return (
    <div className="ring" role="img" aria-label={`${label}: ${value} of ${max}`}>
      <svg viewBox="0 0 64 64">
        <circle className="track" cx="32" cy="32" r={r} fill="none" strokeWidth="6" />
        <circle className="bar" cx="32" cy="32" r={r} fill="none" strokeWidth="6" strokeDasharray={`${(pct * c).toFixed(1)} ${c.toFixed(1)}`} />
      </svg>
      <div className="label">{Math.round(pct * 100)}%</div>
    </div>
  )
}
