// 전역 배경 파티클 Canvas
// 베지어 곡선 경로를 따라 천천히 흐르는 빛 입자들
// 60fps를 유지하기 위해 transform/opacity만 사용
import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

interface Particle {
  x: number; y: number
  vx: number; vy: number
  size: number; opacity: number
  targetOpacity: number
  color: string             // amber or aqua
  // 베지어 곡선 흐름용
  t: number                 // 경로 진행도 0~1
  speed: number
  // 사인 곡선 흔들림
  sineOffset: number
  sineAmp: number
  sineFreq: number
}

const COLORS = ['#4FD8C8', '#4FD8C8', '#8B6FE8', '#FF8A3D']

function createParticle(w: number, h: number): Particle {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)]
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    size: Math.random() * 1.5 + 0.5,
    opacity: 0,
    targetOpacity: Math.random() * 0.35 + 0.05,
    color,
    t: Math.random(),
    speed: Math.random() * 0.00015 + 0.00005,
    sineOffset: Math.random() * Math.PI * 2,
    sineAmp: Math.random() * 30 + 10,
    sineFreq: Math.random() * 0.5 + 0.2,
  }
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()
  const rafRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const previousWidth = canvas.width
      const previousHeight = canvas.height
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      if (particlesRef.current.length > 0 && previousWidth > 0 && previousHeight > 0) {
        const scaleX = canvas.width / previousWidth
        const scaleY = canvas.height / previousHeight
        particlesRef.current.forEach((particle) => {
          particle.x *= scaleX
          particle.y *= scaleY
        })
      }
    }
    resize()
    window.addEventListener('resize', resize)

    const mobile = window.matchMedia('(max-width: 639px), (pointer: coarse)').matches

    if (reduced || mobile) {
      particlesRef.current = Array.from({ length: 16 }, () => {
        const particle = createParticle(canvas.width, canvas.height)
        particle.opacity = particle.targetOpacity * 0.65
        return particle
      })

      particlesRef.current.forEach((p) => {
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4)
        grad.addColorStop(0, p.color + Math.round(p.opacity * 255).toString(16).padStart(2, '0'))
        grad.addColorStop(1, p.color + '00')
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      })

      return () => window.removeEventListener('resize', resize)
    }

    const COUNT = 42
    particlesRef.current = Array.from({ length: COUNT }, () =>
      createParticle(canvas.width, canvas.height)
    )

    let frame = 0
    let lastDraw = 0
    const draw = (time: number) => {
      if (document.hidden) {
        rafRef.current = requestAnimationFrame(draw)
        return
      }

      if (time - lastDraw < 33) {
        rafRef.current = requestAnimationFrame(draw)
        return
      }
      lastDraw = time
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      particlesRef.current.forEach(p => {
        // 사인 곡선 흔들림
        const sine = Math.sin(frame * p.sineFreq * 0.01 + p.sineOffset)
        p.x += p.vx + sine * 0.08
        p.y += p.vy + Math.cos(frame * p.sineFreq * 0.008) * 0.06

        // 경계에서 부드럽게 반전
        if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx) }
        if (p.x > canvas.width)  { p.x = canvas.width;  p.vx = -Math.abs(p.vx) }
        if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy) }
        if (p.y > canvas.height) { p.y = canvas.height; p.vy = -Math.abs(p.vy) }

        // opacity 부드럽게 전환
        p.opacity += (p.targetOpacity - p.opacity) * 0.015
        if (Math.abs(p.opacity - p.targetOpacity) < 0.005) {
          p.targetOpacity = Math.random() * 0.35 + 0.05
        }

        // 방사형 그라디언트 글로우
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4)
        grad.addColorStop(0,   p.color + Math.round(p.opacity * 255).toString(16).padStart(2,'0'))
        grad.addColorStop(0.5, p.color + Math.round(p.opacity * 80).toString(16).padStart(2,'0'))
        grad.addColorStop(1,   p.color + '00')

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        // 중심 점
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color + Math.round(p.opacity * 255).toString(16).padStart(2,'0')
        ctx.fill()
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      particlesRef.current = []
    }
  }, [reduced])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.45 }}
      aria-hidden="true"
    />
  )
}
