import { motion } from 'motion/react'
import { Fragment } from 'react'
import {
  SURFACE_STRUCTURE_RANGE,
  generateRegressionCurve,
  type RegressionComparison,
  type RegressionPrediction,
} from '../../lib/simulation'

interface RegressionChartProps {
  regression: RegressionPrediction
  comparison: RegressionComparison
}

const curve = generateRegressionCurve(120)
const width = 320
const height = 118
const pad = { left: 30, right: 12, top: 12, bottom: 24 }
const plotW = width - pad.left - pad.right
const plotH = height - pad.top - pad.bottom

function xPos(x: number): number {
  const t = (x - SURFACE_STRUCTURE_RANGE.min) /
    (SURFACE_STRUCTURE_RANGE.max - SURFACE_STRUCTURE_RANGE.min)
  return pad.left + t * plotW
}

function yPos(value100: number): number {
  return pad.top + (1 - Math.max(0, Math.min(100, value100)) / 100) * plotH
}

function pathFor(values: number[]): string {
  return values
    .map((value, i) => {
      const p = curve[i]
      const command = i === 0 ? 'M' : 'L'
      return `${command}${xPos(p.x).toFixed(2)},${yPos(value).toFixed(2)}`
    })
    .join(' ')
}

const subjectivePath = pathFor(curve.map(p => p.subjectiveVisibilityScaled))
const objectivePath = pathFor(curve.map(p => p.objectiveVisibility))
const erasabilityPath = pathFor(curve.map(p => p.erasability))

export function RegressionChart({ regression, comparison }: RegressionChartProps) {
  const guideX = xPos(regression.surfaceStructureIndex)
  const guideValues = [
    { label: '주관적', value: regression.subjectiveVisibilityScaled, color: '#4FD8C8' },
    { label: '객관적', value: regression.objectiveVisibility, color: '#7FEEE2' },
    { label: '지움성', value: regression.erasability, color: '#FF8A3D' },
  ]

  const rows = [
    {
      label: '주관적 가시성',
      actual: comparison.material.subjectiveVisibility,
      predicted: comparison.prediction.subjectiveVisibility,
      unit: '점',
    },
    {
      label: '객관적 가시성',
      actual: comparison.material.objectiveVisibility,
      predicted: comparison.prediction.objectiveVisibility,
      unit: '점',
    },
    {
      label: '지움성',
      actual: comparison.material.erasability,
      predicted: comparison.prediction.erasability,
      unit: '점',
    },
  ]

  return (
    <div className="glass-card p-4">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="section-label mb-1">상관관계 요약</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--ivory-dim)' }}>
            가시성·지움성 경향을 압축해 표시합니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-[11px] font-subtitle" style={{ color: 'var(--ivory-dim)' }}>
          {[
            ['주관 ×10', '#4FD8C8'],
            ['객관', '#7FEEE2'],
            ['지움성', '#FF8A3D'],
          ].map(([label, color]) => (
            <span key={label} className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid min-w-0 gap-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[118px] w-full">
          <rect
            x={pad.left}
            y={pad.top}
            width={plotW}
            height={plotH}
            rx="6"
            fill="rgba(13,17,32,0.45)"
            stroke="rgba(46,63,102,0.55)"
          />
          {[0, 50, 100].map(v => (
            <g key={v}>
              <line
                x1={pad.left}
                x2={pad.left + plotW}
                y1={yPos(v)}
                y2={yPos(v)}
                stroke="rgba(46,63,102,0.35)"
                strokeWidth="0.7"
              />
              <text
                x={pad.left - 7}
                y={yPos(v) + 3}
                textAnchor="end"
                fontSize="7"
                fill="rgba(160,152,136,0.7)"
                fontFamily="JetBrains Mono, monospace"
              >
                {v}
              </text>
            </g>
          ))}

          <path d={subjectivePath} fill="none" stroke="#4FD8C8" strokeWidth="2" />
          <path d={objectivePath} fill="none" stroke="#7FEEE2" strokeWidth="2" />
          <path d={erasabilityPath} fill="none" stroke="#FF8A3D" strokeWidth="2" />

          <motion.line
            x1={guideX}
            x2={guideX}
            y1={pad.top}
            y2={pad.top + plotH}
            stroke="rgba(245,240,232,0.75)"
            strokeWidth="1"
            strokeDasharray="4,4"
            animate={{ x1: guideX, x2: guideX }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          />
          {guideValues.map(item => (
            <motion.circle
              key={item.label}
              cx={guideX}
              cy={yPos(item.value)}
              r="3"
              fill={item.color}
              stroke="rgba(8,10,18,0.9)"
              strokeWidth="1"
              animate={{ cx: guideX, cy: yPos(item.value) }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}

          <text x={width / 2} y={height - 8} textAnchor="middle" fontSize="7.5" fill="rgba(160,152,136,0.75)" fontFamily="Space Grotesk, Pretendard, sans-serif">
            정밀비교값
          </text>
        </svg>

        <div className="min-w-0 rounded-xl p-3" style={{ background: 'rgba(79,216,200,0.05)', border: '1px solid rgba(79,216,200,0.18)' }}>
          <p className="mb-2 text-xs font-subtitle font-bold leading-relaxed" style={{ color: 'var(--ivory)' }}>
            {comparison.material.name} 실제 측정값 · 회귀식 예측값
          </p>
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] gap-x-3 gap-y-1.5 text-[11px]">
            <span style={{ color: 'var(--ivory-dim)' }}>지표</span>
            <span className="text-right" style={{ color: 'var(--ivory-dim)' }}>실제</span>
            <span className="text-right" style={{ color: 'var(--ivory-dim)' }}>예측</span>
            {rows.map(row => (
              <Fragment key={row.label}>
                <span className="min-w-0 truncate" style={{ color: 'var(--ivory)' }}>{row.label}</span>
                <span className="font-mono text-right" style={{ color: 'var(--aqua)' }}>
                  {row.actual.toFixed(2)}{row.unit}
                </span>
                <span className="font-mono text-right" style={{ color: 'var(--amber-bright)' }}>
                  {row.predicted.toFixed(2)}{row.unit}
                </span>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
