// 슬라이더 + 숫자 직접 입력 복합 컨트롤
// 슬라이더로 감을 잡고, 정확한 측정값은 숫자로 타이핑 가능
import { useRef, useState } from 'react'
import { motion } from 'motion/react'

interface SliderInputProps {
  label: string
  hint: string            // 입력 옆 한 줄 설명
  value: number
  min: number
  max: number
  step: number
  unit?: string
  decimals?: number
  onChange: (v: number) => void
  colorScheme?: 'aqua' | 'amber' | 'violet'
}

export function SliderInput({
  label,
  hint,
  value,
  min,
  max,
  step,
  unit = '',
  decimals = 2,
  onChange,
  colorScheme = 'aqua',
}: SliderInputProps) {
  const [editing, setEditing] = useState(false)
  const [raw, setRaw] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const accent = colorScheme === 'aqua'
    ? { text: '#4FD8C8', glow: 'rgba(79,216,200,0.3)', bg: 'rgba(79,216,200,0.08)' }
    : colorScheme === 'amber'
    ? { text: '#FF8A3D', glow: 'rgba(255,138,61,0.3)',  bg: 'rgba(255,138,61,0.08)' }
    : { text: '#8B6FE8', glow: 'rgba(139,111,232,0.3)', bg: 'rgba(139,111,232,0.08)' }

  const progress = (value - min) / (max - min)  // 0~1

  const commit = (str: string) => {
    const num = parseFloat(str)
    if (!isNaN(num)) onChange(Math.max(min, Math.min(max, num)))
    setEditing(false)
  }

  const handleRangeChange = (nextValue: string) => {
    const next = parseFloat(nextValue)
    if (!isNaN(next)) onChange(next)
  }

  return (
    <div className="flex flex-col gap-2.5">
      {/* 라벨 행 */}
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-subtitle font-semibold tracking-wider uppercase"
              style={{ color: accent.text }}>
          {label}
        </span>

        {/* 수치 표시 / 직접 입력 필드 */}
        {editing ? (
          <input
            ref={inputRef}
            type="number"
            defaultValue={value.toFixed(decimals)}
            min={min}
            max={max}
            step={step}
            autoFocus
            className="w-24 text-right text-sm font-mono bg-transparent outline-none
                       border-b pb-0.5"
            style={{ color: accent.text, borderColor: accent.text }}
            onBlur={e => commit(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') commit((e.target as HTMLInputElement).value)
              if (e.key === 'Escape') setEditing(false)
            }}
          />
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setEditing(true)}
            className="mono text-sm px-2 py-0.5 rounded-md cursor-text"
            style={{ color: accent.text, background: accent.bg }}
            title="클릭해 직접 입력"
          >
            {value.toFixed(decimals)}{unit}
          </motion.button>
        )}
      </div>

      {/* 슬라이더 + 트랙 */}
      <div className="relative">
        {/* 진행 채우기 오버레이 */}
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 h-1 rounded-l-full pointer-events-none"
          style={{
            width: `${progress * 100}%`,
            background: accent.text,
            boxShadow: `0 0 6px ${accent.glow}`,
          }}
        />
        <input
          type="range"
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={value}
          onInput={e => handleRangeChange((e.target as HTMLInputElement).value)}
          onChange={e => handleRangeChange(e.target.value)}
          className="relative z-10"
          style={
            {
              '--range-accent': accent.text,
            } as React.CSSProperties
          }
        />
      </div>

      {/* 한 줄 힌트 */}
      <p className="text-xs leading-relaxed" style={{ color: 'var(--ivory-dim)' }}>
        {hint}
      </p>
    </div>
  )
}
