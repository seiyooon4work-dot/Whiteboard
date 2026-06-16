import { memo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ReflectionMetrics } from '../../types/simulation'

type ReflectionChartProps = {
  metrics: ReflectionMetrics
  specularWindow: number
}

export const ReflectionChart = memo(function ReflectionChart({ metrics, specularWindow }: ReflectionChartProps) {
  const left = metrics.theoreticalAngle - specularWindow
  const right = metrics.theoreticalAngle + specularWindow

  return (
    <div className="glass-card min-w-0 p-3 sm:p-5">
      <div className="mb-4 flex flex-col items-start gap-2 sm:flex-row sm:justify-between sm:gap-3">
        <div>
          <p className="section-label mb-1">정반사 기준 분포</p>
          <h3 className="font-display text-lg font-bold text-ivory">반사각 히스토그램</h3>
        </div>
        <div className="text-left font-mono text-[11px] sm:text-right sm:text-xs">
          <div style={{ color: 'var(--aqua-bright)' }}>
            정반사 {metrics.theoreticalAngle.toFixed(0)}° ± {specularWindow}°
          </div>
          <div>
            <span style={{ color: 'var(--ivory-dim)' }}>피크 </span>
            <span style={{ color: 'rgba(255,184,112,0.72)' }}>{metrics.peakAngle.toFixed(0)}°</span>
          </div>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-subtitle font-semibold sm:text-xs">
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1"
          style={{ color: 'var(--aqua-bright)', background: 'rgba(79,216,200,0.09)' }}
        >
          <span className="h-3 w-0.5 rounded-full" style={{ background: 'var(--aqua-bright)' }} />
          정반사 기준
        </span>
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1"
          style={{ color: 'var(--amber-bright)', background: 'rgba(255,138,61,0.09)' }}
        >
          <span className="h-3 w-0.5 rounded-full border-l border-dashed" style={{ borderColor: 'var(--amber-bright)' }} />
          피크
        </span>
      </div>

      <div className="h-52 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={metrics.histogram} margin={{ top: 12, right: 8, bottom: 4, left: -24 }}>
            <CartesianGrid stroke="rgba(46,63,102,0.5)" vertical={false} />
            <XAxis
              dataKey="angle"
              tick={{ fill: '#A09888', fontSize: 10 }}
              stroke="rgba(160,152,136,0.35)"
              unit="°"
              interval={5}
            />
            <YAxis tick={{ fill: '#A09888', fontSize: 10 }} stroke="rgba(160,152,136,0.35)" />
            <Tooltip
              cursor={{ fill: 'rgba(79,216,200,0.08)' }}
              contentStyle={{
                background: '#0D1120',
                border: '1px solid rgba(46,63,102,0.8)',
                borderRadius: 8,
                color: '#F5F0E8',
              }}
              labelFormatter={(value) => `${value}° bin`}
            />
            <ReferenceArea
              x1={left}
              x2={right}
              fill="rgba(127,238,226,0.12)"
              stroke="#7FEEE2"
              strokeOpacity={0.34}
            />
            <ReferenceLine
              x={metrics.theoreticalAngle}
              stroke="#7FEEE2"
              strokeWidth={3}
            />
            <ReferenceLine
              x={metrics.peakAngle}
              stroke="rgba(255,184,112,0.56)"
              strokeDasharray="3 5"
            />
            <Bar
              dataKey="count"
              radius={[3, 3, 0, 0]}
              fill="#4FD8C8"
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-xs leading-relaxed" style={{ color: 'var(--ivory-dim)' }}>
        밝은 영역은 이론적 정반사 방향과 정반사 판정 범위입니다.
        피크는 실제 계산 분포에서 가장 많이 모인 각도이며, 보조 참고값으로만 표시합니다.
      </p>
    </div>
  )
})
