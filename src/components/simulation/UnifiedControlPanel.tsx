import { motion } from 'motion/react'
import { Search, SlidersHorizontal } from 'lucide-react'
import {
  SURFACE_STRUCTURE_RANGE,
  type SimulationInputs,
} from '../../lib/simulation'
import type { SurfaceParams } from '../../types/simulation'
import { SliderInput } from '../ui/SliderInput'

type UnifiedControlPanelProps = {
  inputs: SimulationInputs
  params: SurfaceParams
  onInputChange: (key: keyof SimulationInputs, value: number) => void
  onSurfaceStructureChange: (value: number) => void
  onSurfaceParamChange: (key: keyof SurfaceParams, value: number) => void
  onOptimize: () => void
  isOptimizing: boolean
}

const CORE_PHYSICS_SLIDERS: Array<{
  key: keyof SurfaceParams
  label: string
  hint: string
  min: number
  max: number
  step: number
  decimals: number
  unit?: string
}> = [
  { key: 'roughness', label: '표면 거칠기', hint: '값이 커질수록 반사 분포가 넓어집니다.', min: 0, max: 1, step: 0.01, decimals: 2 },
  { key: 'incidentAngle', label: '입사각', hint: '법선 기준 입사각입니다. 이론적 정반사각도 함께 이동합니다.', min: -70, max: 70, step: 1, decimals: 0, unit: '°' },
]

const ADVANCED_SLIDERS: Array<{
  key: keyof SurfaceParams
  label: string
  hint: string
  min: number
  max: number
  step: number
  decimals: number
  unit?: string
}> = [
  { key: 'grooveDepth', label: '홈 깊이', hint: '방향성 홈의 깊이입니다. 정밀비교값과 지움성에 직접 연결됩니다.', min: 0, max: 1, step: 0.01, decimals: 2 },
  { key: 'grooveFrequency', label: '홈 반복 빈도', hint: '홈의 반복 빈도입니다. 반사 패턴에 직접 반영됩니다.', min: 1, max: 20, step: 1, decimals: 0 },
  { key: 'randomness', label: '불규칙 요철', hint: '불규칙 요철 정도입니다. 반사각 분포의 퍼짐을 바꿉니다.', min: 0, max: 1, step: 0.01, decimals: 2 },
  { key: 'anisotropy', label: '방향성', hint: '표면 결의 방향성입니다. 특정 방향 집중 반사를 만들 수 있습니다.', min: 0, max: 1, step: 0.01, decimals: 2 },
  { key: 'macroCurvature', label: '큰 굴곡', hint: '큰 스케일의 완만한 굴곡입니다. 전체 반사 방향을 흔듭니다.', min: 0, max: 1, step: 0.01, decimals: 2 },
  { key: 'lightCount', label: '광선 수', hint: '계산·표시에 사용할 광선 수입니다.', min: 20, max: 300, step: 5, decimals: 0 },
  { key: 'specularWindow', label: '정반사 판정 범위', hint: '정반사로 분류할 허용 각도입니다.', min: 2, max: 20, step: 1, decimals: 0, unit: '°' },
]

export function UnifiedControlPanel({
  inputs,
  params,
  onInputChange,
  onSurfaceStructureChange,
  onSurfaceParamChange,
  onOptimize,
  isOptimizing,
}: UnifiedControlPanelProps) {
  return (
    <div
      className="glass-card flex min-w-0 flex-col gap-4 p-3 sm:p-4"
      style={{ borderColor: 'rgba(46,63,102,0.72)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-label mb-1">설계 패널</p>
          <h3 className="font-display text-xl font-bold text-ivory">표면 설계</h3>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--ivory-dim)' }}>
            핵심 값만 조절하고, 세부 물리값은 고급 설정에서 보정합니다.
          </p>
        </div>
        <span
          className="rounded-lg p-2"
          style={{ background: 'rgba(79,216,200,0.08)', color: 'var(--aqua-bright)' }}
        >
          <SlidersHorizontal size={18} />
        </span>
      </div>

      <section className="rounded-xl p-3" style={{ background: 'rgba(13,17,32,0.45)', border: '1px solid rgba(46,63,102,0.38)' }}>
        <p className="mb-4 text-xs font-subtitle font-bold uppercase tracking-widest" style={{ color: 'var(--aqua)' }}>
          실험 기준
        </p>
        <div className="flex flex-col gap-4">
          <SliderInput
            label="정밀비교값"
            hint="표면의 홈과 요철 정도입니다. 3D roughness와 groove depth로 이어집니다."
            value={inputs.surfaceStructureIndex}
            min={SURFACE_STRUCTURE_RANGE.min}
            max={SURFACE_STRUCTURE_RANGE.max}
            step={0.01}
            decimals={2}
            onChange={onSurfaceStructureChange}
            colorScheme="aqua"
          />
          <SliderInput
            label="지움성"
            hint="높일수록 표면은 매끄러운 쪽으로 부드럽게 이동하지만, 물리 균형도 함께 검사합니다."
            value={inputs.erasability}
            min={0}
            max={100}
            step={0.01}
            unit="점"
            decimals={2}
            onChange={(value) => onInputChange('erasability', value)}
            colorScheme="amber"
          />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
          {[
            { label: '주관적 가시성', value: `${inputs.visibility.toFixed(2)}점` },
            { label: '객관적 가시성', value: `${inputs.objectiveVisibility.toFixed(1)}점` },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg p-2.5"
              style={{ background: 'rgba(79,216,200,0.05)', border: '1px solid rgba(79,216,200,0.16)' }}
            >
              <p className="text-[10px] font-subtitle" style={{ color: 'var(--ivory-dim)' }}>
                {item.label}
              </p>
              <p className="mt-1 font-mono text-sm font-bold" style={{ color: 'var(--aqua-bright)' }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl p-3" style={{ background: 'rgba(13,17,32,0.45)', border: '1px solid rgba(46,63,102,0.38)' }}>
        <p className="mb-4 text-xs font-subtitle font-bold uppercase tracking-widest" style={{ color: 'var(--aqua-bright)' }}>
          반사 조건
        </p>
        <div className="flex flex-col gap-4">
          {CORE_PHYSICS_SLIDERS.map((slider) => (
            <SliderInput
              key={slider.key}
              label={slider.label}
              hint={slider.hint}
              value={params[slider.key]}
              min={slider.min}
              max={slider.max}
              step={slider.step}
              decimals={slider.decimals}
              unit={slider.unit}
              onChange={(value) => onSurfaceParamChange(slider.key, value)}
              colorScheme={slider.key === 'incidentAngle' ? 'amber' : 'aqua'}
            />
          ))}
        </div>
      </section>

      <details
        className="rounded-xl p-3"
        style={{ background: 'rgba(13,17,32,0.35)', border: '1px solid rgba(46,63,102,0.32)' }}
      >
        <summary className="cursor-pointer text-xs font-subtitle font-bold uppercase tracking-widest" style={{ color: 'var(--ivory-dim)' }}>
          고급 물리 설정
        </summary>
        <div className="mt-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div
              className="rounded-lg p-2 text-left text-xs"
              style={{ background: 'rgba(245,240,232,0.04)', border: '1px solid rgba(46,63,102,0.28)', color: 'var(--ivory-dim)' }}
            >
              주관/객관 가시성은 정밀비교값과 재질 데이터에서 자동 계산
            </div>
            <div
              className="rounded-lg p-2 text-left text-xs"
              style={{ background: 'rgba(245,240,232,0.04)', border: '1px solid rgba(46,63,102,0.28)', color: 'var(--ivory-dim)' }}
            >
              세부 파라미터는 물리 검증용 보정값
            </div>
          </div>
          {ADVANCED_SLIDERS.map((slider) => (
            <SliderInput
              key={slider.key}
              label={slider.label}
              hint={slider.hint}
              value={params[slider.key]}
              min={slider.min}
              max={slider.max}
              step={slider.step}
              decimals={slider.decimals}
              unit={slider.unit}
              onChange={(value) => onSurfaceParamChange(slider.key, value)}
              colorScheme="violet"
            />
          ))}
        </div>
      </details>

      <motion.button
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.97 }}
        disabled={isOptimizing}
        onClick={onOptimize}
        className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest disabled:opacity-60"
        style={{
          background: 'linear-gradient(135deg, rgba(79,216,200,0.2), rgba(139,111,232,0.13))',
          border: '1px solid rgba(79,216,200,0.42)',
          color: 'var(--aqua-bright)',
        }}
      >
        <Search size={16} />
        {isOptimizing ? '최적 조건 계산 중...' : '통합 최적 표면 찾기'}
      </motion.button>
    </div>
  )
}
