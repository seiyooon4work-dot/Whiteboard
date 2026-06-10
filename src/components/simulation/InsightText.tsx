// 결과 해석 한국어 문장 컴포넌트
// 점수만 던지지 않고 결과를 쉬운 말로 풀어 준다
import { motion, AnimatePresence } from 'motion/react'
import { type SimulationResult } from '../../lib/simulation'
import { ErasabilityWarning } from '../ui/GlowBadge'

interface InsightTextProps {
  result: SimulationResult
}

export function InsightText({ result }: InsightTextProps) {
  const { qualityScore, erasabilityWarning, interpretText, inputs } = result
  const qual = Math.round(qualityScore)

  // 품질 등급
  const grade =
    qual >= 75 ? { label: '최우수', color: '#4FD8C8' } :
    qual >= 60 ? { label: '양호',   color: '#7FEEE2' } :
    qual >= 45 ? { label: '보통',   color: '#A09888' } :
                 { label: '개선 필요', color: '#FF8A3D' }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={qual}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card flex min-w-0 flex-col gap-4 p-3 sm:p-4 xl:p-5"
      >
        {/* 등급 배지 + 점수 */}
        <div className="flex items-center justify-between">
          <span
            className="no-split rounded-full px-3 py-1 text-xs font-subtitle font-bold uppercase tracking-widest"
            style={{
              color:   grade.color,
              background: grade.color + '18',
              border:  `1px solid ${grade.color}50`,
            }}
          >
            {grade.label}
          </span>
          <span className="font-mono text-2xl font-bold" style={{ color: grade.color }}>
            {qual}<span className="text-sm font-normal ml-0.5" style={{ color: 'var(--ivory-dim)' }}>/100</span>
          </span>
        </div>

        {/* 해석 문장 */}
        <p className="text-sm leading-relaxed font-body" style={{ color: 'var(--ivory-dim)' }}>
          {interpretText}
        </p>

        {/* 세부 수치 */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(72px,1fr))] gap-2 pt-1 xl:gap-3">
          {[
            {
              label: '주관적',
              value: `${inputs.visibility.toFixed(2)}점`,
              good:  inputs.visibility >= 6,
            },
            {
              label: '객관적',
              value: `${inputs.objectiveVisibility.toFixed(2)}점`,
              good:  inputs.objectiveVisibility >= 70,
            },
            {
              label: '지움성',
              value: `${inputs.erasability.toFixed(2)}점`,
              good:  inputs.erasability >= 70,
            },
          ].map(item => (
            <div key={item.label} className="flex flex-col gap-0.5 text-center">
              <span
                className="font-mono text-base font-bold xl:text-lg"
                style={{ color: item.good ? 'var(--aqua)' : 'var(--amber)' }}
              >
                {item.value}
              </span>
              <span className="text-xs font-subtitle" style={{ color: 'var(--ivory-dim)' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs leading-relaxed" style={{ color: 'var(--ivory-ghost)' }}>
          현재 입력값과 표면 구조 기반 지움성 보정을 함께 반영한 결과입니다.
        </p>

        {/* 지움성 경고 */}
        <ErasabilityWarning show={erasabilityWarning} />
      </motion.div>
    </AnimatePresence>
  )
}
