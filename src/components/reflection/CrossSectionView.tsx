import { memo } from 'react'
import type { ReflectionSample, SurfaceData } from '../../types/simulation'

type CrossSectionViewProps = {
  surface: SurfaceData
  samples: ReflectionSample[]
  emphasis?: boolean
}

const WIDTH = 920
const HEIGHT = 260
const SURFACE_BASE = 146
const X_MIN = 48
const X_MAX = WIDTH - 48
const X_SCALE = (X_MAX - X_MIN) / 2
const Z_SCALE = X_SCALE
const ARROW_LENGTH = 0.18

function sx(x: number): number {
  return X_MIN + (x + 1) * X_SCALE
}

function sy(z: number, centerHeight: number): number {
  return SURFACE_BASE - (z - centerHeight) * Z_SCALE
}

function arrowEnd(x: number, y: number, vx: number, vz: number, length: number): [number, number] {
  return [x + vx * X_SCALE * length, y - vz * Z_SCALE * length]
}

function makeSmoothPath(points: Array<[number, number]>): string {
  if (points.length < 2) return ''

  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point[0]} ${point[1]}`

    const previous = points[index - 1]
    const controlX = (previous[0] + point[0]) / 2
    return `${path} Q ${previous[0]} ${previous[1]} ${controlX} ${(previous[1] + point[1]) / 2} T ${point[0]} ${point[1]}`
  }, '')
}

export const CrossSectionView = memo(function CrossSectionView({ surface, samples, emphasis = false }: CrossSectionViewProps) {
  const mid = Math.floor(surface.size / 2)
  const centerHeight = (surface.minHeight + surface.maxHeight) / 2
  const sectionPoints = surface.points[mid].map((point) => [sx(point.x), sy(point.z, centerHeight)] as [number, number])
  const surfacePath = makeSmoothPath(sectionPoints)
  const fillPath = `${surfacePath} L ${X_MAX} 224 L ${X_MIN} 224 Z`
  const visibleSamples = samples

  return (
    <div
      className="glass-card min-w-0 p-3 sm:p-5"
      style={emphasis ? { borderColor: 'rgba(79,216,200,0.34)', boxShadow: '0 0 26px rgba(79,216,200,0.08)' } : undefined}
    >
      <div className="mb-3 flex flex-col items-start gap-2 sm:mb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
        <div>
          <p className="section-label mb-1">2D 단면 반사 검증</p>
          <h3 className="font-display text-lg font-bold text-ivory">
            표면 기울기와 반사각 계산
          </h3>
        </div>
        <div className="flex gap-2 text-[11px] font-mono sm:text-xs">
          <span style={{ color: 'var(--amber-bright)' }}>입사광</span>
          <span style={{ color: 'var(--aqua-bright)' }}>반사광</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={`${emphasis ? 'h-[220px] sm:h-[300px] lg:h-[360px]' : 'h-[200px] sm:h-[260px]'} w-full overflow-hidden`}>
        <defs>
          <marker id="incident-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#FFB870" />
          </marker>
          <marker id="reflection-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#7FEEE2" />
          </marker>
          <linearGradient id="surface-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(79,216,200,0.34)" />
            <stop offset="100%" stopColor="rgba(79,216,200,0.02)" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width={WIDTH} height={HEIGHT} rx="18" fill="rgba(8,10,18,0.45)" />
        {Array.from({ length: 9 }, (_, index) => (
          <line
            key={index}
            x1={48 + index * ((WIDTH - 96) / 8)}
            x2={48 + index * ((WIDTH - 96) / 8)}
            y1="24"
            y2="220"
            stroke="rgba(46,63,102,0.28)"
          />
        ))}
        <path d={fillPath} fill="url(#surface-fill)" stroke="none" />
        <path d={surfacePath} fill="none" stroke="#4FD8C8" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />

        {visibleSamples.map((sample) => {
          const x = sx(sample.x)
          const y = sy(sample.z, centerHeight)
          const incidentStart = arrowEnd(x, y, -sample.incident.x, -sample.incident.z, ARROW_LENGTH)
          const reflectedEnd = arrowEnd(x, y, sample.reflection.x, sample.reflection.z, ARROW_LENGTH * 1.14)
          const normalEnd = arrowEnd(x, y, sample.normal.x, sample.normal.z, ARROW_LENGTH * 0.55)

          return (
            <g key={`${sample.ix}-${sample.iy}`}>
              <line
                x1={x}
                y1={y}
                x2={normalEnd[0]}
                y2={normalEnd[1]}
                stroke="rgba(245,240,232,0.38)"
                strokeWidth="1.4"
                strokeDasharray="4 4"
              />
              <line
                x1={incidentStart[0]}
                y1={incidentStart[1]}
                x2={x}
                y2={y}
                stroke="#FFB870"
                strokeWidth="2"
                opacity="0.76"
                markerEnd="url(#incident-arrow)"
              />
              <line
                x1={x}
                y1={y}
                x2={reflectedEnd[0]}
                y2={reflectedEnd[1]}
                stroke="#7FEEE2"
                strokeWidth="2"
                opacity="0.86"
                markerEnd="url(#reflection-arrow)"
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
})
