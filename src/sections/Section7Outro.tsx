// 섹션 7 — 마무리
// 연구 결론 한 문장 + 팀 크레딧 + SIMULATION 타이포 리프라이즈
import { motion } from 'motion/react'
import { useInView } from '../hooks/useInView'

const TEAM = [
  { role: 'Leader',  name: 'Seiyoon Chang',  initial: 'C' },
  { role: 'Member',  name: 'Jay Joo',        initial: 'J' },
  { role: 'Member',  name: 'Inseo Jeong',    initial: 'J' },
  { role: 'Member',  name: 'Wooshin Choi',   initial: 'C' },
  { role: 'Member',  name: 'Yoonhan Hwang',  initial: 'H' },
]

export function Section7Outro() {
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.2 })

  // min-h-screen 제거 — section-pad 패딩으로 충분한 여백 확보
  return (
    <section id="outro" ref={ref} className="relative section-pad flex flex-col items-center justify-center overflow-hidden">
      {/* 배경 그라디언트 */}
      <div className="absolute inset-0 pointer-events-none"
           style={{
             background: 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(139,111,232,0.04) 0%, transparent 70%)',
           }} />

      {/* 배경 대형 SIMULATION 타이포 */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.5 }}
      >
        <span
          className="font-display font-black select-none"
          style={{
            fontSize: 'clamp(5rem, 22vw, 18rem)',
            color: 'transparent',
            WebkitTextStroke: '1px rgba(46,63,102,0.35)',
            whiteSpace: 'nowrap',
          }}
        >
          SIMULATION
        </span>
      </motion.div>

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-8 text-center sm:gap-10 lg:gap-12">
        {/* 결론 문장 */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <p className="section-label mb-4">연구 결론</p>
          <blockquote
            className="font-display font-bold leading-tight"
            style={{ fontSize: 'clamp(1.5rem, 4.5vw, 3rem)', color: 'var(--ivory)' }}
          >
            "모든 자리가{' '}
            <span className="gradient-text-aqua">공평하게</span>
            {' '}잘 보이는<br />교실을 만들 수 있습니다."
          </blockquote>
          <p className="text-sm mt-4 max-w-lg mx-auto" style={{ color: 'var(--ivory-dim)' }}>
            화이트보드 표면의 거칠기를 최적화함으로써 빛 반사로 인한 자리별 가시성 차이를 줄이고,
            학생 모두가 동등한 환경에서 수업을 들을 수 있습니다.
          </p>
        </motion.div>

        {/* 팀 크레딧 */}
        <motion.div
          className="flex flex-col items-center gap-5"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div
            className="max-w-full px-4 py-2 text-center text-[10px] font-subtitle font-semibold uppercase sm:px-8 sm:text-xs"
            style={{
              background: 'rgba(79,216,200,0.06)',
              border: '1px solid rgba(79,216,200,0.2)',
              color: 'var(--aqua)',
            }}
          >
            HAFS EUREKA RESEARCH PROJECT — 2026. 06
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {TEAM.map((member, i) => (
              <motion.div
                key={member.name}
                className={`flex flex-col items-center gap-1 ${i === TEAM.length - 1 ? 'col-span-2 sm:col-span-1' : ''}`}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.7 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-base font-display font-bold"
                  style={{
                    background: `rgba(79,216,200,${0.06 + i * 0.02})`,
                    border: '1px solid rgba(79,216,200,0.2)',
                    color: 'var(--aqua)',
                  }}
                >
                  {member.initial}
                </div>
                <p className="text-xs font-subtitle font-semibold" style={{ color: 'var(--ivory)' }}>
                  {member.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--ivory-dim)' }}>
                  {member.role}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* HANKUK ACADEMY OF FOREIGN STUDIES */}
        <motion.p
          className="font-subtitle text-xs tracking-[0.3em] uppercase"
          style={{ color: 'var(--ivory-ghost)' }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.2 }}
        >
          Hankuk Academy of Foreign Studies
        </motion.p>

        {/* 맨 위로 */}
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex flex-col items-center gap-2 group"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-8 h-8 rounded-full border flex items-center justify-center"
            style={{ borderColor: 'rgba(79,216,200,0.3)', color: 'var(--aqua)' }}
          >
            ↑
          </motion.div>
          <span className="text-xs font-subtitle tracking-widest uppercase"
                style={{ color: 'var(--ivory-dim)' }}>
            처음으로
          </span>
        </motion.button>
      </div>
    </section>
  )
}
