// App.tsx — 시뮬레이션 전용 루트 컴포넌트
import { lazy, Suspense } from 'react'
import { ArrowDown, BarChart3, SlidersHorizontal, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { ParticleField } from './components/canvas/ParticleField'
import { UnifiedSurfaceProvider } from './hooks/useUnifiedSurfaceSimulation'

const Section5Lab = lazy(() =>
  import('./sections/Section5Lab').then((module) => ({ default: module.Section5Lab }))
)

const Section6Result = lazy(() =>
  import('./sections/Section6Result').then((module) => ({ default: module.Section6Result }))
)

function SectionFallback() {
  return (
    <section className="section-pad">
      <div className="mx-auto h-64 max-w-6xl rounded-2xl glass-card" />
    </section>
  )
}

const simulationSteps = [
  { number: '01', label: '재질 선택', icon: SlidersHorizontal },
  { number: '02', label: '슬라이더 조절', icon: Sparkles },
  { number: '03', label: '결과 비교', icon: BarChart3 },
]

function SimulationIntro() {
  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="start" className="simulation-hero relative overflow-hidden">
      <div className="simulation-hero__halo simulation-hero__halo--a" aria-hidden="true" />
      <div className="simulation-hero__halo simulation-hero__halo--b" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-5 pb-12 pt-5 sm:px-8 sm:pb-16 sm:pt-7 lg:px-12 lg:pb-24">
        <nav className="simulation-topbar" aria-label="시뮬레이션 탐색">
          <a href="#start" className="simulation-brand">
            <span className="simulation-brand__mark" aria-hidden="true">H</span>
            <span>HAFS <em>/</em> SURFACE LAB</span>
          </a>
          <div className="simulation-topbar__links">
            <a href="#simulator">시뮬레이터</a>
            <a href="#result">결과 해석</a>
          </div>
        </nav>

        <div className="grid gap-12 pb-6 pt-16 lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)] lg:items-center lg:gap-16 lg:pb-20 lg:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="simulation-kicker">SLIDER-DRIVEN SURFACE SIMULATION</p>
            <h1 className="simulation-hero__title">
              빛이 고르게 흩어지는
              <br />
              <span>표면을 직접 설계하세요.</span>
            </h1>
            <p className="simulation-hero__copy">
              실험 설명을 따라가는 대신, 슬라이더를 움직이며 표면 구조와 반사 조건이
              교실에서의 가시성에 어떤 차이를 만드는지 바로 확인합니다.
            </p>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="simulation-button simulation-button--primary" onClick={() => jumpTo('simulator')}>
                시뮬레이션 시작
                <ArrowDown size={16} aria-hidden="true" />
              </button>
              <button type="button" className="simulation-button simulation-button--quiet" onClick={() => jumpTo('result')}>
                결과 먼저 보기
              </button>
            </div>

            <div className="simulation-steps" aria-label="시뮬레이션 사용 순서">
              {simulationSteps.map(({ number, label, icon: Icon }, index) => (
                <div key={number} className="simulation-step">
                  <span className="simulation-step__icon"><Icon size={15} aria-hidden="true" /></span>
                  <span>
                    <small>{number}</small>
                    <strong>{label}</strong>
                  </span>
                  {index < simulationSteps.length - 1 && <i aria-hidden="true" />}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="simulation-hero__preview"
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.14, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="simulation-preview__grid" aria-hidden="true" />
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-3">
                <p className="section-label">LIVE MODEL / DEFAULT CONDITION</p>
                <span className="simulation-live-dot"><i /> LIVE</span>
              </div>
              <div className="simulation-preview__headline">
                <div>
                  <p className="simulation-preview__eyebrow">현재 시뮬레이션</p>
                  <h2>균형점 찾기</h2>
                </div>
                <span className="simulation-preview__score">Q<span>/100</span></span>
              </div>
              <div className="simulation-preview__meter" aria-hidden="true">
                <span />
              </div>
              <div className="simulation-preview__readouts">
                <div><small>가시성</small><strong>V</strong><span>반사 화면</span></div>
                <div><small>지움성</small><strong>E</strong><span>사용 균형</span></div>
                <div><small>표면 구조</small><strong>S</strong><span>슬라이더 입력</span></div>
              </div>
              <div className="simulation-preview__hint">
                <SlidersHorizontal size={17} aria-hidden="true" />
                <span>값을 바꾸면 2D 반사·3D 표면·좌석 결과가 함께 갱신됩니다.</span>
              </div>
            </div>
          </motion.div>
        </div>

        <button type="button" className="simulation-scroll-cue" onClick={() => jumpTo('simulator')}>
          <span>SCROLL TO SIMULATOR</span>
          <ArrowDown size={15} aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}

export default function App() {
  return (
    <div className="simulation-app">
      <ParticleField />
      <main>
        <SimulationIntro />
        <Suspense fallback={<SectionFallback />}>
          <UnifiedSurfaceProvider>
            <Section5Lab />
            <Section6Result />
          </UnifiedSurfaceProvider>
        </Suspense>
      </main>
      <footer className="simulation-footer">
        <span>HAFS / SURFACE LAB</span>
        <span>슬라이더 기반 화이트보드 표면 시뮬레이션</span>
      </footer>
    </div>
  )
}
