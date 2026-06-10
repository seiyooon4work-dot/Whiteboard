// 섹션 3 — 원리
// "왜 자리마다 다르게 보일까?"
// GSAP ScrollTrigger pin: 표면 거칠기 매끄/거침 모핑 + 광선 패턴 전환
import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { motion } from 'motion/react'
import { Tooltip } from '../components/ui/Tooltip'

gsap.registerPlugin(ScrollTrigger)

export function Section3Principle() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const [progress, setProgress] = useState(0)  // 0(매끄) ~ 1(거침)

  const updateProgressFromPointer = (clientX: number, target: HTMLElement) => {
    const rect = target.getBoundingClientRect()
    const nextProgress = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    setProgress(nextProgress)
  }

  useGSAP(() => {
    const media = gsap.matchMedia()

    media.add('(min-width: 1024px)', () => {
      const proxy = { p: 0 }
      gsap.to(proxy, {
        p: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: self => setProgress(self.progress),
        },
      })
    })

    return () => media.revert()
  }, { scope: containerRef })

  // 표면 거칠기에 따른 색 보간
  const surfaceColor = `rgba(${Math.round(245 - progress * 100)},${Math.round(240 - progress * 80)},${Math.round(232 - progress * 90)}, 0.85)`
  const isSmooth = progress < 0.5
  const label = progress < 0.25 ? '매끄러운 표면'
    : progress < 0.5 ? '약간 거친 표면'
    : progress < 0.75 ? '적당히 거친 표면'
    : '매우 거친 표면'

  // height = 핀 구간 길이. 160vh: 1뷰포트 고정 + 60vh 스크롤 여유
  return (
    <div ref={containerRef} className="h-auto lg:h-[140vh]">
      <section
        id="principle"
        className="relative flex min-h-0 flex-col items-center justify-center overflow-hidden px-4 py-14 md:px-10 md:py-16 lg:h-screen lg:px-6 lg:py-0"
      >
        {/* 배경 그라디언트 */}
        <div className="absolute inset-0 pointer-events-none"
             style={{
               background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${
                 progress > 0.5 ? 'rgba(79,216,200,0.04)' : 'rgba(255,138,61,0.04)'
               } 0%, transparent 70%)`,
               transition: 'background 0.8s',
             }} />

        <div className="max-w-5xl w-full mx-auto">
          <motion.p className="section-label mb-3">03 — 물리 원리</motion.p>
          <h2
            className="font-display font-bold mb-2"
            style={{ fontSize: 'clamp(1.8rem, 5vw, 3.5rem)', color: 'var(--ivory)' }}
          >
            왜 자리마다 다르게 보일까?
          </h2>
          <p className="mb-5 max-w-md text-sm" style={{ color: 'var(--ivory-dim)' }}>
            스크롤하거나 아래 바를 클릭·드래그하면 표면이 매끄러움 → 거침으로 바뀝니다.<br className="hidden sm:block" />
            빛의 반사 패턴이 어떻게 달라지는지 보세요.
          </p>

          {/* 인터랙티브 반사 다이어그램 */}
          <div className="grid items-center gap-5 lg:grid-cols-2 lg:gap-8">
            <ReflectionDiagram progress={progress} surfaceColor={surfaceColor} />

            {/* 설명 텍스트 */}
            <div className="flex flex-col gap-4 sm:gap-6">
              {/* 현재 상태 */}
              <motion.div
                key={label}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="rounded-xl p-4 sm:p-5"
                style={{
                  background: progress > 0.5 ? 'rgba(79,216,200,0.06)' : 'rgba(255,138,61,0.06)',
                  border: `1px solid ${progress > 0.5 ? 'rgba(79,216,200,0.25)' : 'rgba(255,138,61,0.25)'}`,
                }}
              >
                <p className="font-subtitle font-bold text-sm mb-1"
                   style={{ color: progress > 0.5 ? 'var(--aqua)' : 'var(--amber)' }}>
                  {label}
                </p>
                <p className="text-sm" style={{ color: 'var(--ivory-dim)' }}>
                  {progress < 0.35
                    ? '빛이 거울처럼 한 방향으로 강하게 튕깁니다. 특정 자리(특히 1·7·8번)에서 심한 번쩍임이 발생합니다.'
                    : progress < 0.65
                    ? '정반사와 난반사가 섞입니다. 번쩍임이 줄어들지만 지움성도 약간 감소합니다.'
                    : '빛이 여러 방향으로 고르게 흩어집니다. 모든 자리에서 비슷하게 잘 보이지만, 마카가 잘 안 지워질 수 있습니다.'}
                </p>
              </motion.div>

              {/* 용어 설명 */}
              <div className="flex flex-col gap-3">
                {[
                  { term: '정반사', def: '거울처럼 빛이 한 방향으로 튕기는 현상입니다. 매끄러운 표면에서 강하게 나타납니다.' },
                  { term: '난반사', def: '빛이 여러 방향으로 흩어지는 현상입니다. 거친 표면에서 나타나며 눈부심이 적습니다.' },
                  { term: '마찰력', def: '표면의 거칠기를 나타내는 값입니다. 클수록 표면이 거칩니다.' },
                ].map(item => (
                  <div key={item.term} className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
                    <Tooltip term={item.term} definition={item.def}>
                      <span className="inline-flex min-w-[4rem] flex-none items-center justify-center whitespace-nowrap rounded px-2 py-0.5 text-xs font-mono font-semibold"
                            style={{ background: 'rgba(79,216,200,0.1)', color: 'var(--aqua)' }}>
                        {item.term}
                      </span>
                    </Tooltip>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--ivory-dim)' }}>
                      {item.def}
                    </p>
                  </div>
                ))}
              </div>

              {/* 비유 */}
              <p className="text-xs italic p-3 rounded-lg"
                 style={{ background: 'rgba(245,240,232,0.04)', color: 'var(--ivory-dim)', borderLeft: '3px solid rgba(139,111,232,0.4)' }}>
                "매끄러운 칠판은 <strong style={{ color: 'var(--amber)' }}>거울</strong>처럼,
                거친 칠판은 <strong style={{ color: 'var(--aqua)' }}>종이</strong>처럼 빛을 다룹니다."
              </p>
            </div>
          </div>

          {/* 스크롤 진행 바 */}
          <div className="mt-5 flex items-center gap-2 sm:gap-3">
            <span className="text-[10px] font-mono sm:text-xs" style={{ color: 'var(--amber)' }}>매끄러움</span>
            <div
              className="group relative flex-1 cursor-ew-resize py-4"
              role="slider"
              aria-label="표면 거칠기"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              tabIndex={0}
              onPointerMove={(event) => {
                if (!isDraggingRef.current && event.buttons !== 1) return
                updateProgressFromPointer(event.clientX, event.currentTarget)
              }}
              onPointerDown={(event) => {
                isDraggingRef.current = true
                event.currentTarget.setPointerCapture(event.pointerId)
                updateProgressFromPointer(event.clientX, event.currentTarget)
              }}
              onPointerUp={(event) => {
                isDraggingRef.current = false
                event.currentTarget.releasePointerCapture(event.pointerId)
              }}
              onPointerCancel={() => {
                isDraggingRef.current = false
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowLeft') setProgress((p) => Math.max(0, p - 0.04))
                if (event.key === 'ArrowRight') setProgress((p) => Math.min(1, p + 0.04))
              }}
            >
              <div className="h-1 rounded-full overflow-hidden"
                   style={{ background: 'rgba(46,63,102,0.5)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress * 100}%`,
                    background: 'linear-gradient(90deg, var(--amber), var(--aqua))',
                  }}
                />
              </div>
              <motion.div
                className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100"
                style={{
                  left: `calc(${progress * 100}% - 8px)`,
                  background: progress < 0.5 ? 'var(--amber)' : 'var(--aqua)',
                  boxShadow: '0 0 14px rgba(79,216,200,0.45)',
                }}
              />
            </div>
            <span className="text-[10px] font-mono sm:text-xs" style={{ color: 'var(--aqua)' }}>거침</span>
          </div>
        </div>
      </section>
    </div>
  )
}

// 반사 다이어그램 SVG
function ReflectionDiagram({
  progress, surfaceColor,
}: { progress: number; surfaceColor: string }) {
  // 입사 광선 종점 (표면 중앙)
  const incidentEnd = { x: 200, y: 160 }
  const surfaceY = 170
  const surfacePoints = Array.from({ length: 18 }, (_, i) => {
    const t = i / 17
    const x = 40 + t * 320
    const primaryWave = Math.sin(t * Math.PI * (3.5 + progress * 5.5) + 0.4)
    const secondaryWave = Math.sin(t * Math.PI * (9 + progress * 5) + 1.2) * 0.35
    const amplitude = 1.2 + progress * 13
    const y = surfaceY - Math.max(0, primaryWave * 0.75 + secondaryWave + 0.45) * amplitude
    return { x, y }
  })
  const surfaceCurve =
    `M ${surfacePoints[0].x.toFixed(1)},${surfacePoints[0].y.toFixed(1)} ` +
    surfacePoints.slice(1).map((point, i) => {
      const prev = surfacePoints[i]
      const cx = (prev.x + point.x) / 2
      const cy = (prev.y + point.y) / 2
      return `Q ${prev.x.toFixed(1)},${prev.y.toFixed(1)} ${cx.toFixed(1)},${cy.toFixed(1)}`
    }).join(' ') +
    ` T ${surfacePoints[surfacePoints.length - 1].x.toFixed(1)},${surfacePoints[surfacePoints.length - 1].y.toFixed(1)}`
  const surfaceFill = `${surfaceCurve} L 360,250 L 40,250 Z`

  // 반사 광선들 생성
  const reflectionRays = Array.from({ length: 1 + Math.round(progress * 6) }, (_, i) => {
    const totalRays = 1 + Math.round(progress * 6)
    const baseAngle = -45  // 정반사 방향
    const spread = progress * 76
    const angle = totalRays === 1 ? baseAngle : baseAngle - spread / 2 + (i / (totalRays - 1)) * spread
    const rad = (angle * Math.PI) / 180
    const len = 82 + progress * 16
    return {
      id: i,
      x2: incidentEnd.x + Math.cos(rad) * len,
      y2: incidentEnd.y + Math.sin(rad) * len,
      opacity: totalRays === 1 ? 0.9 : 0.28 + (0.42 / totalRays),
      isSpecular: totalRays === 1 || (i === Math.floor(totalRays / 2)),
    }
  })

  return (
    <div className="relative">
      <svg viewBox="0 0 400 280" className="mx-auto w-full max-w-md overflow-hidden">
        <defs>
          <linearGradient id="principleSurfaceFill" x1="40" y1="145" x2="360" y2="250" gradientUnits="userSpaceOnUse">
            <stop stopColor={progress < 0.5 ? 'rgba(245,240,232,0.9)' : 'rgba(125,231,219,0.92)'} />
            <stop offset="1" stopColor="rgba(31,45,68,0.72)" />
          </linearGradient>
          <linearGradient id="principleBoardFill" x1="40" y1="170" x2="360" y2="250" gradientUnits="userSpaceOnUse">
            <stop stopColor="rgba(15,23,39,0.82)" />
            <stop offset="1" stopColor="rgba(9,13,25,0.9)" />
          </linearGradient>
          <marker id="incidentArrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="strokeWidth">
            <path d="M 0 0 L 9 4.5 L 0 9 z" fill="rgba(245,240,232,0.82)" />
          </marker>
          <marker id="reflectionArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
            <path d="M 0 0 L 8 4 L 0 8 z" fill="rgba(79,216,200,0.82)" />
          </marker>
        </defs>

        {/* 표면 배경 */}
        <rect x="40" y="170" width="320" height="80" rx="4"
              fill="url(#principleBoardFill)"
              stroke="rgba(46,63,102,0.4)" strokeWidth="0.8" />

        {/* 표면 질감 (거칠기에 따라 완만한 height-map 단면으로 변화) */}
        <motion.path
          d={surfaceFill}
          fill="url(#principleSurfaceFill)"
          stroke={progress < 0.5 ? 'rgba(245,240,232,0.55)' : 'rgba(79,216,200,0.75)'}
          strokeWidth="1.3"
          animate={{ d: surfaceFill }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: 'drop-shadow(0 4px 10px rgba(79,216,200,0.14))' }}
        />
        <motion.path
          d={surfaceCurve}
          fill="none"
          stroke={surfaceColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          animate={{ d: surfaceCurve }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* 표면 라벨 */}
        <text x="200" y="210" textAnchor="middle"
              fontSize="10" fill="rgba(160,152,136,0.7)"
              fontFamily="Space Grotesk, Pretendard, sans-serif" letterSpacing="2">
          {progress < 0.4 ? '매끄러운 표면 (SMOOTH)' : progress < 0.7 ? '중간 거칠기' : '거친 표면 (ROUGH)'}
        </text>

        {/* 입사 광선 */}
        <line
          x1="116" y1="58"
          x2={incidentEnd.x} y2={incidentEnd.y}
          stroke="rgba(245,240,232,0.78)"
          strokeWidth="2"
          strokeDasharray="none"
          markerEnd="url(#incidentArrow)"
          style={{ filter: 'drop-shadow(0 0 3px rgba(245,240,232,0.5))' }}
        />
        <text x="150" y="96" fontSize="9" fill="rgba(245,240,232,0.62)"
              fontFamily="Space Grotesk, Pretendard, sans-serif">
          입사광
        </text>

        {/* 법선 (수직선) */}
        <line
          x1={incidentEnd.x} y1="100"
          x2={incidentEnd.x} y2={incidentEnd.y}
          stroke="rgba(46,63,102,0.5)"
          strokeWidth="0.8"
          strokeDasharray="4,4"
        />

        {/* 반사 광선들 */}
        {reflectionRays.map(ray => (
          <g key={ray.id}>
            <line
              x1={incidentEnd.x} y1={incidentEnd.y}
              x2={ray.x2} y2={ray.y2}
              stroke={ray.isSpecular && progress < 0.5
                ? `rgba(255,138,61,${ray.opacity})`
                : `rgba(79,216,200,${ray.opacity})`}
              strokeWidth={ray.isSpecular ? 1.8 : 1}
              strokeLinecap="round"
              markerEnd="url(#reflectionArrow)"
              style={{
                filter: ray.isSpecular
                  ? 'drop-shadow(0 0 4px rgba(255,138,61,0.5))'
                  : 'drop-shadow(0 0 3px rgba(79,216,200,0.16))',
              }}
            />
          </g>
        ))}

        {/* 정반사·난반사 라벨 */}
        <text x="270" y="80" fontSize="9"
              fill={progress < 0.5 ? 'rgba(255,138,61,0.8)' : 'rgba(79,216,200,0.7)'}
              fontFamily="Space Grotesk, Pretendard, sans-serif" fontWeight="700"
              style={{ transition: 'fill 0.5s' }}>
          {progress < 0.5 ? '정반사 →' : '← 난반사'}
        </text>

        {/* 하단 안내 */}
        <text x="200" y="270" textAnchor="middle"
              fontSize="9" fill="rgba(160,152,136,0.5)"
              fontFamily="Pretendard, sans-serif">
          스크롤하거나 아래 바를 클릭·드래그해 표면을 바꿔 보세요
        </text>
      </svg>
    </div>
  )
}
