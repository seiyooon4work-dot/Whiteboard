// 섹션 0 — 로딩
// 흩어진 빛 입자가 중심으로 모여 사이트가 열린다 (2초 이내)
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'

interface Section0LoadingProps {
  onComplete: () => void
}

export function Section0Loading({ onComplete }: Section0LoadingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    const cx = canvas.width  / 2
    const cy = canvas.height / 2
    const COUNT = 80

    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      targetX: cx + (Math.random() - 0.5) * 4,
      targetY: cy + (Math.random() - 0.5) * 4,
      size:  Math.random() * 2 + 0.5,
      color: Math.random() > 0.4 ? '#4FD8C8' : Math.random() > 0.5 ? '#8B6FE8' : '#FF8A3D',
      speed: Math.random() * 0.025 + 0.015,
    }))

    let progress = 0
    let rafId: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      progress += 0.008

      particles.forEach(p => {
        p.x += (p.targetX - p.x) * p.speed
        p.y += (p.targetY - p.y) * p.speed

        const eased = Math.min(progress / 0.8, 1)
        const op = 0.1 + eased * 0.9

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5)
        grad.addColorStop(0,   p.color + 'CC')
        grad.addColorStop(0.4, p.color + '55')
        grad.addColorStop(1,   p.color + '00')
        ctx.globalAlpha = op
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
        ctx.globalAlpha = 1
      })

      // 중심 수렴 완료 → 빛점 폭발
      if (progress > 1.0) {
        const r = (progress - 1.0) * 120
        const op = Math.max(0, 1 - (progress - 1.0) * 2)
        const grad2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        grad2.addColorStop(0,   `rgba(79,216,200,${op})`)
        grad2.addColorStop(0.4, `rgba(79,216,200,${op * 0.3})`)
        grad2.addColorStop(1,   'rgba(79,216,200,0)')
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fillStyle = grad2
        ctx.fill()
      }

      if (progress < 1.5) rafId = requestAnimationFrame(draw)
    }

    rafId = requestAnimationFrame(draw)

    // 1.8초 후 onComplete 호출
    const timer = setTimeout(onComplete, 1800)
    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(timer)
    }
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[9998] flex flex-col items-center justify-center"
      style={{ background: '#080A12' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <p className="font-subtitle text-xs tracking-[0.4em] uppercase"
           style={{ color: 'var(--aqua)' }}>
          HAFS EUREKA
        </p>
        <p className="font-mono text-xs tracking-widest"
           style={{ color: 'var(--ivory-dim)' }}>
          Loading Simulation...
        </p>
      </motion.div>
    </motion.div>
  )
}
