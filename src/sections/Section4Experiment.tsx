// 섹션 4 — 실험
// "6가지 표면을 직접 비교했어요"
// 재질 카드 6장 + 딜레마 메시지 + 시뮬레이션으로 연결
import { motion } from 'motion/react'
import { useInView } from '../hooks/useInView'
import { MATERIALS } from '../data/materials'
import { MEASURED_MATERIALS } from '../lib/materialData'
import {
  REGRESSION_FORMULAS,
  predictFromSurfaceStructureIndex,
} from '../lib/simulation'

function getExperimentMetrics(material: (typeof MATERIALS)[number]) {
  const measured = MEASURED_MATERIALS.find((item) => item.id === material.id)

  if (measured) {
    return {
      surfaceStructure: measured.surfaceStructureIndex,
      subjectiveVisibility: measured.subjectiveVisibility,
      objectiveVisibility: measured.objectiveVisibility,
      erasability: measured.erasability,
      estimated: false,
    }
  }

  const inferredSurfaceStructure =
    (material.visibility - REGRESSION_FORMULAS.subjectiveVisibility.intercept) /
    REGRESSION_FORMULAS.subjectiveVisibility.slope
  const prediction = predictFromSurfaceStructureIndex(inferredSurfaceStructure)

  return {
    surfaceStructure: prediction.surfaceStructureIndex,
    subjectiveVisibility: material.visibility,
    objectiveVisibility: prediction.objectiveVisibility,
    erasability: prediction.erasability,
    estimated: true,
  }
}

export function Section4Experiment() {
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.1 })

  return (
    <section id="experiment" ref={ref} className="relative section-pad">
      <div className="max-w-6xl mx-auto">
        <motion.p
          className="section-label mb-4"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
        >
          04 — 비교 실험
        </motion.p>

        <motion.h2
          className="font-display font-bold mb-3"
          style={{ fontSize: 'clamp(1.8rem, 5.5vw, 3.8rem)', color: 'var(--ivory)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          6가지 표면을<br />직접 비교했습니다
        </motion.h2>

        <motion.p
          className="text-sm max-w-lg mb-10"
          style={{ color: 'var(--ivory-dim)' }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
        >
          연구팀이 6가지 재질에 직접 마커로 글씨를 쓴 뒤, 여러 자리에서 얼마나 잘 보이는지
          평가하고 표면 구조, 객관적 가시성, 지움성을 함께 비교했습니다.
        </motion.p>

        {/* 재질 카드 그리드 */}
        <div className="grid grid-cols-1 min-[430px]:grid-cols-2 sm:grid-cols-3 gap-4">
          {MATERIALS.map((m, i) => {
            const metrics = getExperimentMetrics(m)

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="glass-card group flex cursor-default flex-col gap-3 p-3 sm:p-5"
                style={{
                  borderColor: `${m.accentColor}30`,
                  transition: 'border-color 0.3s, box-shadow 0.3s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = m.accentColor + '60'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${m.accentColor}18`
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = m.accentColor + '30'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                }}
              >
              {/* 순위 배지 + 이름 */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className="no-split rounded px-2 py-0.5 font-mono text-xs font-bold"
                  style={{ background: m.accentColor + '18', color: m.accentColor }}
                >
                  #{m.rank}
                </span>
                <span
                  className="no-split font-mono text-[10px]"
                  style={{ color: metrics.estimated ? 'var(--amber-bright)' : 'var(--ivory-dim)' }}
                >
                  {metrics.estimated ? '일부 추정값' : '실험 데이터'}
                </span>
              </div>

              <div>
                <h3 className="font-subtitle font-bold text-sm mb-0.5" style={{ color: 'var(--ivory)' }}>
                  {m.name}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--ivory-dim)' }}>
                  {m.description}
                </p>
              </div>

              {/* 보이는 정도 바 */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-subtitle" style={{ color: 'var(--ivory-dim)' }}>
                    보이는 정도
                  </span>
                  <span className="font-mono text-sm font-bold" style={{ color: m.accentColor }}>
                    {metrics.subjectiveVisibility.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden"
                     style={{ background: 'rgba(46,63,102,0.4)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: m.accentColor }}
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${(metrics.subjectiveVisibility / 10) * 100}%` } : { width: 0 }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>

              {/* 실험에서 함께 측정한 핵심 지표 */}
              <div
                className="grid grid-cols-3 gap-px overflow-hidden rounded-lg"
                style={{ background: 'rgba(46,63,102,0.45)' }}
              >
                {[
                  { label: '객관 가시성', value: metrics.objectiveVisibility },
                  { label: '지움성', value: metrics.erasability },
                  { label: '표면 구조', value: metrics.surfaceStructure },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="min-w-0 px-1.5 py-2 text-center"
                    style={{ background: 'rgba(8,10,18,0.56)' }}
                  >
                    <p className="no-split text-[9px] sm:text-[10px]" style={{ color: 'var(--ivory-dim)' }}>
                      {metric.label}
                    </p>
                    <p className="no-split mt-0.5 font-mono text-[11px] font-bold sm:text-xs" style={{ color: m.accentColor }}>
                      {metric.value.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* 마찰계수 표시 */}
              <div className="flex items-center justify-between">
                <span className="no-split shrink-0 text-[10px] sm:text-xs" style={{ color: 'var(--ivory-dim)' }}>마찰계수 μ · 참고</span>
                <div className="flex min-w-0 shrink-0 items-center gap-1">
                  {/* 마찰 시각화 */}
                  {Array.from({ length: 5 }, (_, j) => (
                    <div
                      key={j}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: j < Math.round(m.mu * 5)
                          ? m.accentColor
                          : 'rgba(46,63,102,0.6)',
                      }}
                    />
                  ))}
                  <span className="no-split ml-1 font-mono text-[10px] sm:text-xs" style={{ color: m.accentColor }}>
                    {m.mu.toFixed(2)}
                  </span>
                </div>
              </div>
              </motion.div>
            )
          })}
        </div>

        {/* 딜레마 박스 */}
        <motion.div
          className="mt-12 p-6 rounded-2xl text-center max-w-2xl mx-auto"
          style={{
            background: 'linear-gradient(135deg, rgba(255,138,61,0.06), rgba(79,216,200,0.06))',
            border: '1px solid rgba(139,111,232,0.2)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <p className="font-subtitle font-bold text-base mb-2" style={{ color: 'var(--violet)' }}>
            ⚖ 트레이드오프 딜레마
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--ivory-dim)' }}>
            <span style={{ color: 'var(--aqua)' }}>잘 보이는 표면</span>은 보통 거칠어서{' '}
            <span style={{ color: 'var(--amber)' }}>잘 지워지지 않고</span>,<br />
            <span style={{ color: 'var(--aqua)' }}>잘 지워지는 표면</span>은 매끄러워서{' '}
            <span style={{ color: 'var(--amber)' }}>번쩍임이 심합니다</span>.
          </p>
          <p className="text-sm mt-3 font-subtitle" style={{ color: 'var(--ivory)' }}>
            → 그래서 <strong>최적의 균형점</strong>이 필요합니다. 직접 찾아보세요 ↓
          </p>
        </motion.div>
      </div>
    </section>
  )
}
