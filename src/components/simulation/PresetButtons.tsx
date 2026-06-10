// 실험 재질 프리셋 버튼
// 누르면 해당 재질의 실제 측정값 4개가 슬라이더에 들어간다.
import { motion } from 'motion/react'
import {
  REGRESSION_MATERIALS,
  type RegressionMaterial,
} from '../../lib/simulation'

interface PresetButtonsProps {
  selectedMaterial: RegressionMaterial
  onSelect: (material: RegressionMaterial) => void
}

export function PresetButtons({ selectedMaterial, onSelect }: PresetButtonsProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="section-label">재질 프리셋</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
        {REGRESSION_MATERIALS.map((m, i) => {
          const isActive = selectedMaterial.id === m.id
          const metrics = [
            { label: '정밀', value: m.surfaceStructureIndex.toFixed(2), color: 'var(--aqua)' },
            { label: '주관', value: m.subjectiveVisibility.toFixed(2), color: 'var(--aqua-bright)' },
            { label: '객관', value: m.objectiveVisibility.toFixed(2), color: 'var(--aqua)' },
            { label: '지움', value: m.erasability.toFixed(2), color: 'var(--amber)' },
          ]

          return (
            <motion.button
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(m)}
              className="flex min-w-0 flex-col gap-2.5 rounded-xl p-3 text-left transition-all"
              style={{
                background: isActive
                  ? 'rgba(79,216,200,0.10)'
                  : 'rgba(19,24,41,0.7)',
                border: `1px solid ${isActive ? 'rgba(79,216,200,0.55)' : 'rgba(46,63,102,0.5)'}`,
                boxShadow: isActive ? '0 0 14px rgba(79,216,200,0.18)' : 'none',
              }}
            >
              {/* 이름 */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-sm font-subtitle font-semibold leading-tight"
                  style={{ color: isActive ? '#F5F0E8' : 'var(--ivory-dim)' }}
                >
                  {m.name}
                </span>
                <span
                  className="text-[10px] font-subtitle font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
                  style={{
                    color: isActive ? 'var(--aqua)' : 'var(--ivory-ghost)',
                    background: isActive ? 'rgba(79,216,200,0.12)' : 'rgba(245,240,232,0.04)',
                  }}
                >
                  실제값
                </span>
              </div>

              {/* 4개 실제 측정값 */}
              <div className="grid grid-cols-2 gap-1.5 2xl:grid-cols-4">
                {metrics.map(metric => (
                  <div
                    key={metric.label}
                    className="rounded-lg px-2 py-1.5 text-center"
                    style={{
                      background: 'rgba(13,17,32,0.48)',
                      border: '1px solid rgba(46,63,102,0.38)',
                    }}
                  >
                    <span className="block text-[10px] font-subtitle" style={{ color: 'var(--ivory-ghost)' }}>
                      {metric.label}
                    </span>
                    <span className="block text-xs font-mono font-bold mt-0.5" style={{ color: metric.color }}>
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* 예시값 안내 */}
      <p className="text-xs leading-relaxed" style={{ color: 'var(--ivory-ghost)' }}>
        * 프리셋은 5개 재질의 실제 측정값 4개를 슬라이더에 적용합니다.
      </p>
    </div>
  )
}
