// 숫자가 0에서 목표값까지 카운트업 되는 애니메이션 컴포넌트
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

interface CountUpProps {
  to: number
  duration?: number          // ms
  decimals?: number
  suffix?: string
  prefix?: string
  className?: string
  trigger?: boolean          // false이면 카운트업 시작 안 함
}

export function CountUp({
  to,
  duration = 1400,
  decimals = 0,
  suffix = '',
  prefix = '',
  className = '',
  trigger = true,
}: CountUpProps) {
  const reduced = useReducedMotion()
  const [display, setDisplay] = useState(reduced ? to : 0)
  const rafRef = useRef<number>(0)
  const startRef = useRef<number>(0)

  useEffect(() => {
    if (!trigger) return
    if (reduced) { setDisplay(to); return }

    const startVal = 0
    startRef.current = performance.now()

    const step = (now: number) => {
      const elapsed = now - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      // expo-out easing
      const eased = 1 - Math.pow(2, -10 * progress)
      setDisplay(startVal + (to - startVal) * eased)
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [to, duration, trigger, reduced])

  return (
    <span className={className}>
      {prefix}{display.toFixed(decimals)}{suffix}
    </span>
  )
}
