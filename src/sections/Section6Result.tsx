// 섹션 6 — 결과
// "그래서, 가장 좋은 표면은?"
// 시뮬레이션 최적값 기준 권장 재질 발표
import { motion } from 'motion/react'
import { useInView } from '../hooks/useInView'
import { GlowBadge } from '../components/ui/GlowBadge'
import {
  REGRESSION_MATERIALS,
  findOptimalInputs,
  runSimulation,
  surfaceIndexToStructureScore,
  clampRange,
  type RegressionMaterial,
  type SimulationInputs,
} from '../lib/simulation'

const MATERIAL_META: Record<string, { nameEn: string; accentColor: string; description: string }> = {
  woodrac: {
    nameEn: 'Foam Board',
    accentColor: '#4FD8C8',
    description: '가시성은 가장 높지만 지움성이 매우 낮아 실제 사용 균형은 떨어집니다.',
  },
  'regular-wb': {
    nameEn: 'Regular Whiteboard',
    accentColor: '#7B98CF',
    description: '가시성은 무난하지만 지움성 점수가 낮아 종합 적합도에서 한계가 있습니다.',
  },
  'anti-finger': {
    nameEn: 'Anti-Fingerprint Film',
    accentColor: '#6AADCE',
    description: '지움성은 높지만 정밀비교값과 객관적 가시성이 낮아 균형이 부족합니다.',
  },
  acrylic: {
    nameEn: 'Acrylic Panel',
    accentColor: '#FF8A3D',
    description: '매끄러운 표면 때문에 정밀비교값과 객관적 가시성이 낮게 나타났습니다.',
  },
  'paper-film': {
    nameEn: 'Paper Texture Film',
    accentColor: '#D4B483',
    description: '가시성과 지움성이 함께 높은 편이라 실사용 균형이 가장 좋습니다.',
  },
}

function materialToScores(m: RegressionMaterial): SimulationInputs {
  const surfaceStructure = surfaceIndexToStructureScore(m.surfaceStructureIndex)
  return {
    surfaceStructureIndex: m.surfaceStructureIndex,
    visibility: m.subjectiveVisibility,
    objectiveVisibility: m.objectiveVisibility,
    erasability: m.erasability,
    frictionFit: clampRange(100 - Math.abs(surfaceStructure - 48) * 0.7, 0, 100),
    surfaceStructure,
  }
}

const resultRows = REGRESSION_MATERIALS.map(material => {
  const scores = materialToScores(material)
  const result = runSimulation(scores)
  return {
    material,
    scores,
    result,
    meta: MATERIAL_META[material.id],
  }
}).sort((a, b) => b.result.qualityScore - a.result.qualityScore)

const theoreticalBest = findOptimalInputs()
const theoreticalInputs = theoreticalBest.optimalInputs
const closestMeasured = resultRows.reduce((closest, row) => {
  const currentDistance = Math.abs(row.material.surfaceStructureIndex - theoreticalInputs.surfaceStructureIndex)
  const closestDistance = Math.abs(closest.material.surfaceStructureIndex - theoreticalInputs.surfaceStructureIndex)
  return currentDistance < closestDistance ? row : closest
}, resultRows[0])

export function Section6Result() {
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.15 })

  return (
    <section id="result" ref={ref} className="relative section-pad overflow-hidden">
      {/* 배경 빛 버스트 */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1.5 }}
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(79,216,200,0.07) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-5xl mx-auto">
        <motion.p
          className="section-label mb-4"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
        >
          06 — 연구 결과
        </motion.p>

        <motion.h2
          className="font-display font-bold mb-6"
          style={{ fontSize: 'clamp(1.9rem, 6vw, 4.5rem)', color: 'var(--ivory)' }}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          그래서, 가장 좋은<br className="hidden sm:block" /> 표면은 무엇일까요?
        </motion.h2>

        <div className="grid items-start gap-7 md:grid-cols-2 md:gap-6 lg:gap-10">
          {/* 이론상 최적 표면 발표 카드 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl p-5 sm:rounded-3xl sm:p-8"
            style={{
              background: 'linear-gradient(135deg, rgba(79,216,200,0.08), rgba(139,111,232,0.05))',
              border: '1px solid rgba(79,216,200,0.3)',
              boxShadow: '0 0 50px rgba(79,216,200,0.10)',
            }}
          >
            {/* 배경 글로우 원 */}
            <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full sm:-right-16 sm:-top-16 sm:h-48 sm:w-48"
                 style={{ background: 'radial-gradient(circle, rgba(79,216,200,0.10) 0%, transparent 70%)' }} />

            <div className="relative z-10">
              <GlowBadge type="aqua" className="mb-5">
                이론상 최적 표면
              </GlowBadge>

              <h3
                className="font-display font-bold mb-2"
                style={{ fontSize: 'clamp(2rem, 7vw, 4rem)', color: 'var(--aqua)' }}
              >
                가상 최적 표면
              </h3>
              <p className="mb-5 text-sm font-subtitle leading-relaxed sm:mb-6 sm:text-base" style={{ color: 'var(--ivory-dim)' }}>
                Simulated Optimal Surface · 가까운 실제 재질: {closestMeasured.material.name}
              </p>

              <div className="mb-6 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 sm:gap-4">
                {[
                  { label: '객관 가시성', value: theoreticalInputs.objectiveVisibility, suffix: '점', decimals: 2 },
                  { label: '지움성', value: theoreticalInputs.erasability, suffix: '점', decimals: 2 },
                  { label: '마찰/필기 적정성', value: theoreticalInputs.frictionFit, suffix: '점', decimals: 2 },
                  { label: '최종 적합도',
                    value: theoreticalBest.qualityScore,
                    suffix: '점', decimals: 1 },
                ].map(item => (
                  <div key={item.label}
                       className="flex min-w-0 flex-col gap-1 rounded-xl p-3"
                       style={{ background: 'rgba(79,216,200,0.06)', border: '1px solid rgba(79,216,200,0.15)' }}>
                    <span className="font-mono text-xl font-bold sm:text-2xl" style={{ color: 'var(--aqua)' }}>
                      {item.value.toFixed(item.decimals)}{item.suffix}
                    </span>
                    <span className="text-xs font-subtitle" style={{ color: 'var(--ivory-dim)' }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-sm leading-relaxed" style={{ color: 'var(--ivory-dim)' }}>
                이 값은 실제 재질 하나를 고른 결과가 아니라, 측정값 회귀 모델 안에서 새 통합 점수식이 가장 높아지는
                표면 조건입니다. 실제 후보 중에서는 {closestMeasured.material.name}이 이 조건에 가장 가깝습니다.
              </p>
            </div>
          </motion.div>

          {/* 순위표 */}
          <motion.div
            className="flex min-w-0 flex-col gap-3 sm:gap-4"
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
          >
            <p className="text-xs font-subtitle font-semibold tracking-widest uppercase"
               style={{ color: 'var(--ivory-dim)' }}>
              종합 적합도 순위 (실험 결과)
            </p>

            {resultRows.map(({ material: m, result: simResult, meta }, i) => {
              return (
                <motion.div
                  key={m.id}
                  className="grid min-w-0 grid-cols-[2rem_minmax(0,1fr)_auto] items-start gap-2 rounded-xl p-3 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:gap-4 sm:p-4"
                  style={{
                    background: i === 0 ? `${meta.accentColor}10` : 'rgba(13,17,32,0.5)',
                    border: `1px solid ${i === 0 ? meta.accentColor + '40' : 'rgba(46,63,102,0.4)'}`,
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.08, duration: 0.6 }}
                >
                  <span className="w-8 text-center font-mono text-lg font-bold sm:text-xl"
                        style={{ color: meta.accentColor }}>
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-subtitle text-sm font-bold leading-snug" style={{ color: 'var(--ivory)' }}>
                      {m.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden"
                           style={{ background: 'rgba(46,63,102,0.5)' }}>
                        <div className="h-full rounded-full"
                             style={{
                               width: `${simResult.qualityScore}%`,
                               background: meta.accentColor,
                             }} />
                      </div>
                    </div>
                    <p className="mt-2 text-[10px] font-mono leading-relaxed sm:text-xs" style={{ color: 'rgba(160,152,136,0.78)' }}>
                      주관 {m.subjectiveVisibility.toFixed(2)} · 객관 {m.objectiveVisibility.toFixed(2)} · 지움 {m.erasability.toFixed(2)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="font-mono font-bold text-sm" style={{ color: meta.accentColor }}>
                      {simResult.qualityScore.toFixed(1)}
                    </span>
                    <p className="text-[10px] font-mono sm:text-xs" style={{ color: 'rgba(160,152,136,0.72)' }}>
                      정밀:{m.surfaceStructureIndex.toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {/* 개선 방향 */}
        <motion.div
          className="mt-8 rounded-2xl p-4 sm:mt-12 sm:p-6"
          style={{ background: 'rgba(139,111,232,0.06)', border: '1px solid rgba(139,111,232,0.2)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <p className="font-subtitle font-bold text-base mb-3" style={{ color: 'var(--violet)' }}>
            🔭 개선 방향 제안
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--ivory-dim)' }}>
            <strong style={{ color: 'var(--aqua)' }}>가시성, 지움성, 마찰 적정성, 표면 구조 점수가 함께 균형 잡힌 표면</strong>이
            새 공식에서 가장 안정적인 균형점입니다. 실제 재질 순위는 측정값 비교로 남기고, 최종 결론은 이론상 최적 표면 조건으로 해석합니다.
            이를 통해 모든 자리에서 더 공평하게 잘 보이는 교실 환경을 만들 수 있습니다.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
