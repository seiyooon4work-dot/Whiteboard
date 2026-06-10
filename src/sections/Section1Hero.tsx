// 섹션 1 — 히어로
// "교실의 빛을 다시 설계하다"
// 절제된 보드 라인 그래픽 + 중앙 집중형 발표 표지
import { motion } from 'motion/react'
import { useReducedMotion } from '../hooks/useReducedMotion'

export function Section1Hero() {
  const reduced = useReducedMotion()

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ padding: '4.5rem 1rem 3rem' }}
    >
      {/* 배경 방사형 그라디언트 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 58% 44% at 50% 43%, rgba(79,216,200,0.075) 0%, transparent 68%)',
        }}
      />

      <div className="absolute left-1/2 top-1/2 w-[min(880px,94vw)] -translate-x-1/2 -translate-y-[54%] pointer-events-none">
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          style={{ filter: 'drop-shadow(0 0 54px rgba(79,216,200,0.08))' }}
        >
          <HeroWhiteboard reduced={reduced} />
        </motion.div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto flex min-h-[calc(100vh-8.5rem)] flex-col items-center justify-center text-center">
        <motion.p
          className="font-subtitle text-xs font-semibold uppercase"
          style={{
            color: 'var(--aqua)',
            letterSpacing: '0.32em',
            textShadow: '0 0 18px rgba(79,216,200,0.22)',
          }}
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.7 }}
        >
          HAFS EUREKA 2026
        </motion.p>

        <motion.h1
          className="mt-6 font-display font-bold leading-[1.08] text-center"
          style={{
            fontSize: 'clamp(2.65rem, 8.5vw, 7.2rem)',
            color: 'var(--ivory)',
            textShadow: '0 14px 50px rgba(0,0,0,0.34)',
          }}
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.78, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          교실의 <span className="gradient-text-aqua">빛</span>을
          <br />
          다시 설계하다
        </motion.h1>

        <motion.div
          className="mt-7 h-px w-[min(520px,72vw)]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(79,216,200,0.55), rgba(255,138,61,0.36), transparent)',
          }}
          initial={reduced ? false : { opacity: 0, scaleX: 0.55 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />

        <motion.p
          className="mt-7 max-w-xl text-center text-base leading-relaxed md:text-lg"
          style={{ color: 'var(--ivory-dim)' }}
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.25, duration: 0.75 }}
        >
          왜 어떤 자리에서는 칠판 글씨가 잘 안 보일까?
          <br className="hidden sm:block" />
          빛 반사와 표면 거칠기의 균형을 시뮬레이션으로 확인합니다.
        </motion.p>

        <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
          <motion.div
            className="flex flex-col items-center gap-2"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.65, duration: 0.7 }}
          >
            <p className="text-xs font-subtitle tracking-[0.2em] uppercase"
               style={{ color: 'var(--ivory-dim)' }}>
              Scroll to explore
            </p>
            <motion.div
              animate={reduced ? undefined : { y: [0, 6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="w-5 h-8 rounded-full border flex items-start justify-center pt-1.5"
              style={{ borderColor: 'rgba(160,152,136,0.34)' }}
            >
              <div className="w-1 h-2 rounded-full"
                   style={{ background: 'var(--ivory-dim)' }} />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// 히어로 화이트보드 SVG
function HeroWhiteboard({ reduced }: { reduced: boolean }) {
  return (
    <svg viewBox="0 0 880 390" className="w-full opacity-85" aria-hidden="true">
      <defs>
        <linearGradient id="hero-board-stroke" x1="140" y1="70" x2="740" y2="280" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4FD8C8" stopOpacity="0.55" />
          <stop offset="0.52" stopColor="#F5F0E8" stopOpacity="0.18" />
          <stop offset="1" stopColor="#FF8A3D" stopOpacity="0.45" />
        </linearGradient>
        <radialGradient id="hero-board-glow" cx="50%" cy="44%" r="52%">
          <stop stopColor="#4FD8C8" stopOpacity="0.16" />
          <stop offset="0.68" stopColor="#4FD8C8" stopOpacity="0.025" />
          <stop offset="1" stopColor="#4FD8C8" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="440" cy="190" rx="310" ry="125" fill="url(#hero-board-glow)" />

      <rect x="160" y="78" width="560" height="222" rx="18"
            fill="rgba(245,240,232,0.025)"
            stroke="url(#hero-board-stroke)" strokeWidth="1.2" />
      <rect x="176" y="94" width="528" height="190" rx="12"
            fill="rgba(13,17,32,0.28)"
            stroke="rgba(245,240,232,0.055)" strokeWidth="1" />

      <line x1="204" y1="142" x2="676" y2="142" stroke="rgba(245,240,232,0.045)" strokeWidth="0.8" />
      <line x1="204" y1="222" x2="676" y2="222" stroke="rgba(245,240,232,0.04)" strokeWidth="0.8" />
      <line x1="230" y1="260" x2="650" y2="260" stroke="rgba(79,216,200,0.12)" strokeWidth="1" />

      {!reduced && (
        <>
          <circle cx="440" cy="54" r="4.5" fill="rgba(245,240,232,0.72)"
                  style={{ animation: 'breathe 4.6s ease-in-out infinite' }} />
          {[
            { x2: 274, y2: 284, color: 'rgba(79,216,200,0.12)', width: 0.7 },
            { x2: 390, y2: 286, color: 'rgba(255,138,61,0.22)', width: 0.9 },
            { x2: 440, y2: 296, color: 'rgba(255,138,61,0.24)', width: 0.85 },
            { x2: 490, y2: 286, color: 'rgba(255,138,61,0.18)', width: 0.8 },
            { x2: 606, y2: 284, color: 'rgba(79,216,200,0.12)', width: 0.7 },
          ].map((ray, i) => (
            <line key={i}
              x1="440" y1="54" x2={ray.x2} y2={ray.y2}
              stroke={ray.color}
              strokeWidth={ray.width}
              style={{ animation: `breathe ${4.2 + i * 0.24}s ${i * 0.2}s ease-in-out infinite` }}
            />
          ))}
        </>
      )}

      <rect x="160" y="298" width="560" height="8" rx="2"
            fill="rgba(46,63,102,0.42)" />
      <rect x="536" y="296" width="11" height="12" rx="2" fill="rgba(79,216,200,0.48)" />
      <rect x="560" y="296" width="11" height="12" rx="2" fill="rgba(255,138,61,0.46)" />
    </svg>
  )
}
