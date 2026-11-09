import { fmtNutrient, NUTRIENTS, type NutrientKey } from '../lib/nutrition'

const SHORT: Record<NutrientKey, string> = { kcal: 'kcal', protein_g: 'Prot.', fiber_g: 'Fibre', iron_mg: 'Iron', zinc_mg: 'Zinc', magnesium_mg: 'Mg' }

/**
 * Six-cell nutrient strip: Calories · Protein · Fibre · Iron · Zinc · Magnesium.
 * With `targets`, each cell also shows the % of that day's target.
 */
export function NutriStrip({ values, targets, compact }: { values: Record<NutrientKey, number>; targets?: Record<NutrientKey, number>; compact?: boolean }) {
  return (
    <div className={'nstrip' + (compact ? ' compact' : '')}>
      {NUTRIENTS.map((n) => {
        const v = values[n.key]
        const pct = targets ? Math.round((v / targets[n.key]) * 100) : null
        return (
          <div key={n.key} className="ncell" title={`${n.label}: ${fmtNutrient(n.key, v)} ${n.unit}`}>
            <b>
              {fmtNutrient(n.key, v)}
              <small>{n.key === 'kcal' ? '' : n.unit}</small>
            </b>
            <span>{compact ? SHORT[n.key] : n.key === 'kcal' ? 'kcal' : n.label}</span>
            {pct != null && <em className={pct >= 90 ? 'ok' : pct < 50 ? 'low' : ''}>{pct}%</em>}
          </div>
        )
      })}
    </div>
  )
}
