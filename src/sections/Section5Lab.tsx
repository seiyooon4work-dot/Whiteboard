// ★ 섹션 5 — 완전 통합형 연구 대시보드
// 재질 비교, 표면 설계, 3D 반사 물리, 보정 데이터, 최적화를 한 화면에서 다룬다.
import { lazy, Suspense, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { HelpCircle, X } from 'lucide-react'
import { useUnifiedSurfaceSimulation } from '../hooks/useUnifiedSurfaceSimulation'
import { useInView } from '../hooks/useInView'
import { UnifiedControlPanel } from '../components/simulation/UnifiedControlPanel'
import { PresetButtons } from '../components/simulation/PresetButtons'
import { ClassroomScene } from '../components/simulation/ClassroomScene'
import { QualityGauge } from '../components/simulation/QualityGauge'
import { InsightText } from '../components/simulation/InsightText'
import { MetricsPanel } from '../components/reflection/MetricsPanel'
import { CrossSectionView } from '../components/reflection/CrossSectionView'
import { CalibrationPanel } from '../components/reflection/CalibrationPanel'
import { ModelExplanation } from '../components/reflection/ModelExplanation'
import { calculateReflectionStabilityScore } from '../lib/unifiedSurface'
import { calcInputCoherence } from '../lib/simulation'

const SurfaceScene = lazy(() =>
  import('../components/reflection/SurfaceScene').then((module) => ({ default: module.SurfaceScene }))
)

const ReflectionChart = lazy(() =>
  import('../components/reflection/ReflectionChart').then((module) => ({ default: module.ReflectionChart }))
)

const pct = (value: number) => `${(value * 100).toFixed(1)}%`

function SummaryMetric({ label, value, tone = 'aqua' }: { label: string; value: string; tone?: 'aqua' | 'amber' | 'ivory' }) {
  const color = tone === 'amber'
    ? 'var(--amber-bright)'
    : tone === 'ivory'
      ? 'var(--ivory)'
      : 'var(--aqua-bright)'

  return (
    <div
      className="min-h-[78px] rounded-xl p-3"
      style={{ background: 'rgba(13,17,32,0.54)', border: '1px solid rgba(46,63,102,0.42)' }}
    >
      <p className="text-[10px] font-subtitle uppercase tracking-widest" style={{ color: 'var(--ivory-dim)' }}>
        {label}
      </p>
      <p className="mt-2 font-mono text-lg font-bold leading-snug" style={{ color }}>
        {value}
      </p>
    </div>
  )
}

function ScoreBar({ label, value, color = 'var(--aqua)' }: { label: string; value: number; color?: string }) {
  const safe = Math.max(0, Math.min(100, value))

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-subtitle" style={{ color: 'var(--ivory-dim)' }}>
          {label}
        </span>
        <span className="font-mono text-xs font-bold" style={{ color }}>
          {safe.toFixed(1)}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full" style={{ background: 'rgba(46,63,102,0.45)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          animate={{ width: `${safe}%` }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  )
}

export function Section5Lab() {
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.04 })
  const [showScoreHelp, setShowScoreHelp] = useState(false)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches
  )
  const [mobileAnalysisOpen, setMobileAnalysisOpen] = useState(false)
  const [mobileDetailsOpen, setMobileDetailsOpen] = useState(false)
  const [mobile3DOpen, setMobile3DOpen] = useState(false)
  const {
    inputs,
    setInput,
    setSurfaceStructureIndex,
    surfaceParams,
    setSurfaceParam,
    reflectionResult,
    scoringMetrics,
    result,
    optimalResult,
    unifiedOptimum,
    selectedMaterial,
    isOptimizing,
    unifiedState,
    runOptimize,
    selectMaterial,
    applyCalibrationSample,
  } = useUnifiedSurfaceSimulation()

  useEffect(() => {
    const query = window.matchMedia('(max-width: 639px)')
    const update = () => setIsMobile(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  const reflectionScore = calculateReflectionStabilityScore(scoringMetrics)
  const coherenceScore = calcInputCoherence(result.inputs)
  const structureScore = Math.min(reflectionScore, coherenceScore)
  const nearestName = unifiedOptimum?.nearestRegressionMaterial.name ?? unifiedState.nearestMaterial
  const virtualSurface = unifiedOptimum
    ? `거칠기 ${unifiedOptimum.params.roughness.toFixed(2)} · 홈 ${unifiedOptimum.params.grooveDepth.toFixed(2)}`
    : `거칠기 ${surfaceParams.roughness.toFixed(2)} · 홈 ${surfaceParams.grooveDepth.toFixed(2)}`

  return (
    <section id="lab" ref={ref} className="relative section-pad overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 85% 58% at 52% 12%, rgba(79,216,200,0.07) 0%, transparent 68%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(46,63,102,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(46,63,102,0.22) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1540px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          <p className="section-label mb-3">05 — 통합 연구 시뮬레이션 실험실</p>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(480px,1.15fr)] lg:items-end">
            <div>
              <h2
                className="font-display font-bold text-ivory"
                style={{ fontSize: 'clamp(2rem, 3.7vw, 3.35rem)' }}
              >
                통합 표면 시뮬레이션 실험실
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed" style={{ color: 'var(--ivory-dim)' }}>
                최종 적합도를 먼저 확인하고, 같은 표면 조건을 2D 단면 반사 계산으로 검증합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[150px_minmax(0,1fr)] 2xl:grid-cols-[180px_minmax(0,1fr)]">
              <div
                className="relative flex min-h-[145px] flex-col items-center justify-center rounded-2xl p-4 2xl:min-h-[170px]"
                style={{
                  background: 'rgba(79,216,200,0.07)',
                  border: '1px solid rgba(79,216,200,0.28)',
                  boxShadow: '0 0 26px rgba(79,216,200,0.08)',
                }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <p className="section-label">최종 적합도</p>
                  <button
                    type="button"
                    aria-label="최종 적합도 계산 기준 보기"
                    onClick={() => setShowScoreHelp((open) => !open)}
                    className="rounded-full p-1 transition-colors"
                    style={{
                      color: showScoreHelp ? 'var(--aqua-bright)' : 'var(--ivory-dim)',
                      background: showScoreHelp ? 'rgba(79,216,200,0.12)' : 'rgba(245,240,232,0.05)',
                      border: '1px solid rgba(79,216,200,0.22)',
                    }}
                  >
                    <HelpCircle size={14} />
                  </button>
                </div>
                <QualityGauge score={result.qualityScore} size={118} />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <SummaryMetric label="가상 표면 조건" value={virtualSurface} />
                <SummaryMetric label="가까운 실제 재질" value={nearestName} tone="ivory" />
                <SummaryMetric label="현재 정반사" value={pct(reflectionResult.metrics.specularRatio)} tone="amber" />
                <SummaryMetric label="현재 눈부심" value={pct(reflectionResult.metrics.glareRisk)} tone={reflectionResult.metrics.glareRisk > 0.55 ? 'amber' : 'aqua'} />
              </div>
            </div>
          </div>
          <AnimatePresence>
            {showScoreHelp && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="mt-4 rounded-2xl p-4"
                style={{
                  background: 'rgba(13,17,32,0.86)',
                  border: '1px solid rgba(79,216,200,0.26)',
                  boxShadow: '0 18px 38px rgba(0,0,0,0.18)',
                }}
              >
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="section-label mb-1">점수 계산 기준</p>
                    <h3 className="font-display text-base font-bold text-ivory">통합 점수는 실사용 균형 점수입니다</h3>
                  </div>
                  <button
                    type="button"
                    aria-label="점수 계산 기준 닫기"
                    onClick={() => setShowScoreHelp(false)}
                    className="rounded-full p-1"
                    style={{ color: 'var(--ivory-dim)', background: 'rgba(245,240,232,0.05)' }}
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="grid gap-3 text-xs leading-relaxed md:grid-cols-2" style={{ color: 'var(--ivory-dim)' }}>
                  <p>
                    최종 적합도는 4개 핵심 항목을 단순히 더하지 않고, 각 항목을 곱해서 계산합니다.
                    가장 약한 항목을 한 번 더 반영해서 균형이 무너지면 점수가 분명하게 내려갑니다.
                  </p>
                  <p>
                    입사각은 현재 조명 조건을 보여주는 값이라 2D/히스토그램에는 반영되지만,
                    재질 자체의 통합 점수는 고정 평가 입사각 기준으로 계산합니다.
                  </p>
                </div>
                <div
                  className="mt-3 grid gap-2 rounded-xl px-3 py-3 text-[12px]"
                  style={{ background: 'rgba(245,240,232,0.05)', border: '1px solid rgba(245,240,232,0.11)', color: 'var(--ivory)' }}
                >
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="section-label">정규화</span>
                    <span style={{ color: 'var(--ivory-dim)' }}>각 항목은 0~1 값으로 바꿔 계산합니다.</span>
                  </div>
                  <div className="font-mono">
                    T(x) = 0.02 + 0.98x
                  </div>
                  <div className="font-mono leading-relaxed">
                    Q = 200 × T(V)<sup>0.40</sup> × T(E)<sup>0.30</sup> × T(F)<sup>0.20</sup> × T(S)<sup>0.10</sup>
                    <br />
                    <span className="ml-5">× min(T(V), T(E), T(F), T(S))<sup>0.70</sup></span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] md:grid-cols-4">
                  {[
                    ['V', '가시성', '0.40'],
                    ['E', '지움성', '0.30'],
                    ['F', '마찰/필기', '0.20'],
                    ['S', '표면 구조', '0.10'],
                  ].map(([symbol, label, weight]) => (
                    <div
                      key={label}
                      className="rounded-lg p-2"
                      style={{ background: 'rgba(79,216,200,0.05)', border: '1px solid rgba(79,216,200,0.14)' }}
                    >
                      <p className="font-mono font-bold" style={{ color: 'var(--aqua-bright)' }}>{symbol}</p>
                      <p className="mt-1" style={{ color: 'var(--ivory-dim)' }}>{label}</p>
                      <p className="mt-1 font-mono" style={{ color: 'var(--ivory)' }}>{weight}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[270px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1fr)_300px] 2xl:grid-cols-[300px_minmax(560px,1fr)_330px]">
          <motion.div
            className="order-1"
            initial={{ opacity: 0, x: -28 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.12, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <UnifiedControlPanel
              inputs={inputs}
              params={surfaceParams}
              onInputChange={setInput}
              onSurfaceStructureChange={setSurfaceStructureIndex}
              onSurfaceParamChange={setSurfaceParam}
              onOptimize={runOptimize}
              isOptimizing={isOptimizing}
            />
          </motion.div>

          {!isMobile && (
            <motion.div
              className="order-2 flex min-w-0 flex-col gap-4 sm:gap-5"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.04, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="section-label mb-1">중심 검증 화면</p>
                <h3 className="font-display text-xl font-bold text-ivory sm:text-2xl">2D 단면 기반 반사 계산</h3>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-mono" style={{ color: 'var(--ivory-dim)' }}>
                <span>정밀 {inputs.surfaceStructureIndex.toFixed(2)}</span>
                <span>/</span>
                <span>거칠기 {surfaceParams.roughness.toFixed(2)}</span>
                <span>/</span>
                <span>홈 {surfaceParams.grooveDepth.toFixed(2)}</span>
              </div>
            </div>

            <CrossSectionView
              surface={reflectionResult.surface}
              samples={reflectionResult.crossSectionSamples}
              emphasis
            />

            {inView ? (
              <Suspense fallback={<div className="glass-card h-[350px] p-5" />}>
                <ReflectionChart metrics={reflectionResult.metrics} specularWindow={surfaceParams.specularWindow} />
              </Suspense>
            ) : (
              <div className="glass-card h-[350px] p-5" />
            )}

            <AnimatePresence>
              {unifiedOptimum && optimalResult && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="rounded-2xl p-5"
                  style={{
                    background: 'rgba(79,216,200,0.07)',
                    border: '1px solid rgba(79,216,200,0.34)',
                  }}
                >
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="section-label mb-1">통합 최적화 결과</p>
                      <h4 className="font-display text-lg font-bold text-ivory">가상 최적 표면 조건</h4>
                    </div>
                    <span className="font-mono text-2xl font-bold" style={{ color: 'var(--aqua-bright)' }}>
                      {unifiedOptimum.unifiedQualityScore.toFixed(1)}
                      <span className="ml-1 text-sm" style={{ color: 'var(--ivory-dim)' }}>/100</span>
                    </span>
                  </div>
                  <div className="grid gap-3 text-sm md:grid-cols-3" style={{ color: 'var(--ivory)' }}>
                    <span className="font-mono">거칠기 {unifiedOptimum.params.roughness.toFixed(2)}</span>
                    <span className="font-mono">홈 깊이 {unifiedOptimum.params.grooveDepth.toFixed(2)}</span>
                    <span className="font-mono">홈 빈도 {unifiedOptimum.params.grooveFrequency.toFixed(0)}</span>
                    <span className="font-mono">불규칙성 {unifiedOptimum.params.randomness.toFixed(2)}</span>
                    <span className="font-mono">방향성 {unifiedOptimum.params.anisotropy.toFixed(2)}</span>
                    <span className="font-mono">큰 굴곡 {unifiedOptimum.params.macroCurvature.toFixed(2)}</span>
                  </div>
                  <div className="mt-3 grid gap-3 text-xs md:grid-cols-4" style={{ color: 'var(--ivory-dim)' }}>
                    <span>가까운 재질 {unifiedOptimum.nearestRegressionMaterial.name}</span>
                    <span>정반사 {pct(unifiedOptimum.metrics.specularRatio)}</span>
                    <span>난반사 {pct(unifiedOptimum.metrics.diffuseRatio)}</span>
                    <span>눈부심 {pct(unifiedOptimum.metrics.glareRisk)}</span>
                    <span>지움성 {result.weightedErasabilityScore.toFixed(1)}</span>
                    <span>가시성 {inputs.objectiveVisibility.toFixed(1)}</span>
                    <span>표면 구조 {structureScore.toFixed(1)}</span>
                    <span>반사 {reflectionScore.toFixed(1)} · 일관성 {coherenceScore.toFixed(1)}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </motion.div>
          )}

          {!isMobile && (
            <motion.div
              className="order-3 grid min-w-0 grid-cols-1 gap-4 md:col-span-2 md:grid-cols-3 xl:col-span-1 xl:grid-cols-1 xl:gap-5"
              initial={{ opacity: 0, x: 28 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.18, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            >
            <div className="glass-card p-5">
              <p className="section-label mb-1">통합 점수 구성</p>
              <h3 className="font-display text-lg font-bold text-ivory mb-4">점수 해석</h3>
              <div className="flex flex-col gap-3">
                <ScoreBar label="객관적 가시성" value={inputs.objectiveVisibility} />
                <ScoreBar label="지움성" value={result.weightedErasabilityScore} color="var(--amber-bright)" />
                <ScoreBar label="마찰/필기 적정성" value={inputs.frictionFit} color="var(--violet, #8B6FE8)" />
                <ScoreBar label="표면 구조 점수" value={structureScore} color="var(--aqua-bright)" />
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--ivory-ghost)' }}>
                  표면 구조 점수는 반사 안정성과 입력 일관성 중 더 낮은 값을 사용합니다.
                </p>
              </div>
            </div>

            <MetricsPanel metrics={reflectionResult.metrics} />
            <InsightText result={result} />
            </motion.div>
          )}

          <motion.div
            className="order-2 flex min-w-0 flex-col gap-3 sm:hidden"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.08, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="rounded-xl p-3" style={{ background: 'rgba(13,17,32,0.54)', border: '1px solid rgba(79,216,200,0.22)' }}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="section-label mb-1">현재 결과</p>
                  <h3 className="font-display text-base font-bold text-ivory">핵심 점수 요약</h3>
                </div>
                <span className="font-mono text-xl font-bold" style={{ color: 'var(--aqua-bright)' }}>
                  {result.qualityScore.toFixed(0)}점
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <SummaryMetric label="객관적 가시성" value={inputs.objectiveVisibility.toFixed(1)} />
                <SummaryMetric label="지움성" value={result.weightedErasabilityScore.toFixed(1)} tone="amber" />
                <SummaryMetric label="마찰/필기" value={inputs.frictionFit.toFixed(1)} tone="ivory" />
                <SummaryMetric label="표면 구조" value={structureScore.toFixed(1)} />
              </div>
            </div>

            <details
              className="mobile-analysis-panel"
              open={mobileAnalysisOpen}
              onToggle={(event) => setMobileAnalysisOpen(event.currentTarget.open)}
            >
              <summary>2D 반사 분석 보기</summary>
              <div className="mt-3 flex flex-col gap-3">
                <CrossSectionView surface={reflectionResult.surface} samples={reflectionResult.crossSectionSamples} emphasis />
                {mobileAnalysisOpen && (
                  <Suspense fallback={<div className="glass-card h-[280px] p-4" />}>
                    <ReflectionChart metrics={reflectionResult.metrics} specularWindow={surfaceParams.specularWindow} />
                  </Suspense>
                )}
              </div>
            </details>

            <details
              className="mobile-analysis-panel"
              open={mobileDetailsOpen}
              onToggle={(event) => setMobileDetailsOpen(event.currentTarget.open)}
            >
              <summary>세부 지표와 해석 보기</summary>
              {mobileDetailsOpen && (
                <div className="mt-3 flex flex-col gap-3">
                  <MetricsPanel metrics={reflectionResult.metrics} />
                  <InsightText result={result} />
                </div>
              )}
            </details>
          </motion.div>
        </div>

        <motion.div
          className="mt-5 grid grid-cols-1 items-start gap-5 xl:mt-6 xl:grid-cols-[minmax(0,1fr)_440px] xl:gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="flex min-w-0 flex-col gap-5 self-start"
          >
            <div
              className="hidden min-w-0 rounded-2xl p-3 sm:block sm:p-4"
              style={{ background: 'rgba(13,17,32,0.28)', border: '1px solid rgba(46,63,102,0.38)' }}
            >
              <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="section-label mb-1">3D 보조 시각화</p>
                  <h3 className="font-display text-lg font-bold text-ivory">표면 형태 참고</h3>
                </div>
                <span className="text-xs" style={{ color: 'var(--ivory-dim)' }}>
                  정량 판단은 2D 기준
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--ivory-dim)' }}>
                3D 화면은 표면 형태와 광선 방향을 직관적으로 보여주는 보조 시각화입니다.
                정량 판단은 2D 단면, 반사각 히스토그램, 통합 점수를 기준으로 봅니다.
              </p>
              <div className="mt-4">
                {inView && !isMobile ? (
                  <Suspense
                    fallback={
                      <div
                        className="relative h-[240px] overflow-hidden rounded-xl sm:h-[340px] sm:rounded-2xl"
                        style={{ border: '1px solid rgba(46,63,102,0.72)', background: '#080A12' }}
                      />
                    }
                  >
                    <SurfaceScene surface={reflectionResult.surface} samples={reflectionResult.samples} compact />
                  </Suspense>
                ) : (
                  <div
                    className="relative h-[240px] overflow-hidden rounded-xl sm:h-[340px] sm:rounded-2xl"
                    style={{ border: '1px solid rgba(46,63,102,0.72)', background: '#080A12' }}
                  />
                )}
              </div>
            </div>

            <div className="sm:hidden">
              <button
                type="button"
                onClick={() => setMobile3DOpen((open) => !open)}
                className="mobile-analysis-trigger"
                aria-expanded={mobile3DOpen}
              >
                {mobile3DOpen ? '3D 표면 닫기' : '3D 표면 보기'}
              </button>
              {mobile3DOpen && (
                <div className="mt-3">
                  <Suspense
                    fallback={<div className="h-[240px] rounded-xl" style={{ background: '#080A12', border: '1px solid rgba(46,63,102,0.72)' }} />}
                  >
                    <SurfaceScene surface={reflectionResult.surface} samples={reflectionResult.samples} compact />
                  </Suspense>
                </div>
              )}
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-5 self-start">
            <PresetButtons selectedMaterial={selectedMaterial} onSelect={selectMaterial} />
          </div>
        </motion.div>

        <motion.div
          className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(13,17,32,0.28)', border: '1px solid rgba(46,63,102,0.38)' }}
          >
            <p className="section-label mb-2">세부 분석 안내</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ivory-dim)' }}>
              중심 검증은 위의 2D 단면과 반사각 히스토그램입니다. 아래 자료들은 실제 측정값,
              재질 비교, 모델 설명을 확인하기 위한 보조 패널입니다.
            </p>
          </div>
          <details
            className="rounded-2xl p-4"
            style={{ background: 'rgba(13,17,32,0.28)', border: '1px solid rgba(46,63,102,0.38)' }}
          >
            <summary className="cursor-pointer">
              <span className="section-label">실험값 보정 데이터</span>
              <span className="ml-3 text-xs" style={{ color: 'var(--ivory-dim)' }}>
                표 펼치기
              </span>
            </summary>
            <div className="mt-4 min-w-0 overflow-x-auto">
              <CalibrationPanel onApplyMaterial={applyCalibrationSample} />
            </div>
          </details>
        </motion.div>

        <motion.div
          className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[420px_minmax(0,1fr)]"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.48, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <details className="glass-card p-5">
            <summary className="cursor-pointer">
              <span className="section-label">교실 좌석 보조 화면</span>
              <span className="ml-3 text-xs" style={{ color: 'var(--ivory-dim)' }}>
                펼치기
              </span>
            </summary>
            <div className="mt-4">
              <ClassroomScene result={result} />
            </div>
          </details>
          <details
            className="rounded-2xl p-4"
            style={{ background: 'rgba(13,17,32,0.28)', border: '1px solid rgba(46,63,102,0.38)' }}
          >
            <summary className="cursor-pointer">
              <span className="section-label">계산 모델 설명</span>
              <span className="ml-3 text-xs" style={{ color: 'var(--ivory-dim)' }}>
                펼치기
              </span>
            </summary>
            <div className="mt-4">
              <ModelExplanation />
            </div>
          </details>
        </motion.div>
      </div>
    </section>
  )
}
