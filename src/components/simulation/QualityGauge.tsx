// 원형 품질 게이지 (0~100)
// 원호의 시작점은 고정하고 점수만큼 길이만 표시한다.

interface QualityGaugeProps {
  score: number
  size?: number
}

export function QualityGauge({ score, size = 180 }: QualityGaugeProps) {
  const value = Math.max(0, Math.min(100, score))
  const rounded = Math.round(value)
  const sweep = 300
  const progressDeg = (value / 100) * sweep
  const color = value >= 70 ? '#4FD8C8' : value >= 45 ? '#7FEEE2' : '#FF8A3D'

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      role="meter"
      aria-valuenow={rounded}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`종합 품질 점수 ${rounded}점`}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 210deg, ${color} 0deg ${progressDeg}deg, rgba(46,63,102,0.75) ${progressDeg}deg ${sweep}deg, transparent ${sweep}deg 360deg)`,
          mask: 'radial-gradient(farthest-side, transparent calc(100% - 16px), #000 calc(100% - 15px))',
          WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 16px), #000 calc(100% - 15px))',
          filter: `drop-shadow(0 0 8px ${color}44)`,
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          inset: 18,
          background: 'var(--void)',
          boxShadow: 'inset 0 0 18px rgba(0,0,0,0.55)',
        }}
      />
      <div className="relative z-10 flex flex-col items-center">
        <span
          className="font-display font-bold leading-none"
          style={{ fontSize: 32, color: 'var(--ivory)' }}
        >
          {rounded}
        </span>
        <span
          className="mt-3 font-subtitle text-[10px] tracking-[0.2em]"
          style={{ color: 'var(--ivory-dim)' }}
        >
          / 100
        </span>
        <span
          className="mt-2 font-subtitle text-[8.5px] tracking-[0.18em]"
          style={{ color: 'var(--ivory-dim)' }}
        >
          QUALITY
        </span>
      </div>
    </div>
  )
}
