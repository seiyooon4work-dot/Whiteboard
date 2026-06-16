// 슬라이더 + 숫자 직접 입력 복합 컨트롤
// 슬라이더로 감을 잡고, 정확한 측정값은 숫자로 타이핑 가능
import { useEffect, useRef, useState } from 'react'
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
  const [draftValue, setDraftValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const frameRef = useRef<number | null>(null)
  const pendingValueRef = useRef(value)
  const draggingRef = useRef(false)
  const onChangeRef = useRef(onChange)
  const coarsePointerRef = useRef(
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  )

  const cancelScheduledChange = () => {
    if (frameRef.current === null) return
    if (coarsePointerRef.current) window.clearTimeout(frameRef.current)
    else cancelAnimationFrame(frameRef.current)
    frameRef.current = null
  }

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!draggingRef.current) {
      setDraftValue(value)
      pendingValueRef.current = value
    }
  }, [value])

  useEffect(() => () => {
    cancelScheduledChange()
  }, [])

  const accent = colorScheme === 'aqua'
    ? { text: '#4FD8C8', glow: 'rgba(79,216,200,0.3)', bg: 'rgba(79,216,200,0.08)' }
    : colorScheme === 'amber'
    ? { text: '#FF8A3D', glow: 'rgba(255,138,61,0.3)',  bg: 'rgba(255,138,61,0.08)' }
    : { text: '#8B6FE8', glow: 'rgba(139,111,232,0.3)', bg: 'rgba(139,111,232,0.08)' }

  const progress = Math.max(0, Math.min(1, (draftValue - min) / (max - min)))  // 0~1

  const commit = (str: string) => {
    const num = parseFloat(str)
    if (!isNaN(num)) onChange(Math.max(min, Math.min(max, num)))
    setEditing(false)
  }

  const scheduleRangeChange = (nextValue: string) => {
    const next = parseFloat(nextValue)
    if (isNaN(next)) return

    setDraftValue(next)
    pendingValueRef.current = next
    if (frameRef.current !== null) return

    const commitPendingValue = () => {
      frameRef.current = null
      onChangeRef.current(pendingValueRef.current)
    }

    frameRef.current = coarsePointerRef.current
      ? window.setTimeout(commitPendingValue, 40)
      : requestAnimationFrame(commitPendingValue)
  }

  const finishRangeChange = () => {
    draggingRef.current = false
    if (frameRef.current !== null) {
      cancelScheduledChange()
      onChangeRef.current(pendingValueRef.current)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 라벨 행 */}
      <div className="flex items-center justify-between gap-3">
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
            inputMode="decimal"
            className="h-11 w-28 rounded-md border px-2 text-right font-mono text-base outline-none"
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
            className="mono min-h-9 min-w-20 rounded-lg px-3 py-1.5 text-sm sm:min-h-8 sm:px-3 sm:py-1"
            style={{ color: accent.text, background: accent.bg }}
            title="클릭해 직접 입력"
          >
            {value.toFixed(decimals)}{unit}
          </motion.button>
        )}
      </div>

      {/* 슬라이더 + 트랙 */}
      <div
        className="surface-range-wrap"
        style={
          {
            '--range-accent': accent.text,
            '--range-glow': accent.glow,
          } as React.CSSProperties
        }
      >
        <div className="surface-range-track" />
        <div
          className="surface-range-fill"
          style={{
            width: `calc((100% - var(--range-thumb-size)) * ${progress})`,
          }}
        />
        <input
          type="range"
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={draftValue}
          onChange={e => scheduleRangeChange(e.target.value)}
          onPointerDown={() => {
            draggingRef.current = true
          }}
          onPointerUp={finishRangeChange}
          onPointerCancel={finishRangeChange}
          onBlur={finishRangeChange}
          className="surface-range"
        />
      </div>

      {/* 한 줄 힌트 */}
      <p className="text-xs leading-relaxed" style={{ color: 'var(--ivory-dim)' }}>
        {hint}
      </p>
    </div>
  )
}
