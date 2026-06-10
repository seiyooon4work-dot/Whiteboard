import { memo } from 'react'
import type { ReflectionMetrics } from '../../types/simulation'

type MetricsPanelProps = {
  metrics: ReflectionMetrics
}

const pct = (value: number) => `${Math.round(value * 1000) / 10}%`

export const MetricsPanel = memo(function MetricsPanel({ metrics }: MetricsPanelProps) {
  const cards = [
    { label: 'Specular Ratio', value: pct(metrics.specularRatio), color: 'var(--amber-bright)' },
    { label: 'Diffuse Ratio', value: pct(metrics.diffuseRatio), color: 'var(--aqua-bright)' },
    { label: 'Peak Index', value: metrics.reflectionPeakIndex.toFixed(2), color: 'var(--ivory)' },
    { label: 'Spread', value: `${metrics.reflectionSpread.toFixed(1)}°`, color: 'var(--aqua)' },
    { label: 'Glare Risk', value: pct(metrics.glareRisk), color: metrics.glareRisk > 0.55 ? 'var(--amber)' : 'var(--aqua)' },
    { label: 'Ideal Angle', value: `${metrics.theoreticalAngle.toFixed(0)}°`, color: 'var(--ivory)' },
  ]

  return (
    <div className="glass-card p-3 sm:p-4 xl:p-5">
      <p className="section-label mb-1">Calculated Metrics</p>
      <h3 className="font-display text-lg font-bold text-ivory mb-4">정반사·난반사 지표</h3>

      <div className="grid grid-cols-2 gap-2 xl:gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg p-2.5 xl:p-3"
            style={{ background: 'rgba(13,17,32,0.62)', border: '1px solid rgba(46,63,102,0.46)' }}
          >
            <p className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--ivory-dim)' }}>
              {card.label}
            </p>
            <p className="mt-1 font-mono text-lg font-bold xl:text-xl" style={{ color: card.color }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
})
