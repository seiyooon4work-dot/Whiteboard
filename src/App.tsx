// App.tsx — 루트 컴포넌트
// 로딩 화면 + 전체 섹션 오케스트레이션
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ParticleField } from './components/canvas/ParticleField'
import { ProgressNav } from './components/nav/ProgressNav'
import { Section0Loading } from './sections/Section0Loading'
import { Section1Hero } from './sections/Section1Hero'
import { Section2Problem } from './sections/Section2Problem'
import { Section3Principle } from './sections/Section3Principle'
import { Section4Experiment } from './sections/Section4Experiment'
import { Section5Lab } from './sections/Section5Lab'
import { Section6Result } from './sections/Section6Result'
import { Section7Outro } from './sections/Section7Outro'
import { UnifiedSurfaceProvider } from './hooks/useUnifiedSurfaceSimulation'

export default function App() {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      {/* 로딩 화면 */}
      <AnimatePresence>
        {!loaded && <Section0Loading onComplete={() => setLoaded(true)} />}
      </AnimatePresence>

      {/* 메인 콘텐츠 */}
      <AnimatePresence>
        {loaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* 전역 배경 파티클 Canvas */}
            <ParticleField />

            {/* 고정 진행 표시기 */}
            <ProgressNav />

            {/* 발표 흐름: 실험 → 통합 연구 대시보드 → 결과 → 연구 결론 */}
            <main>
              <Section1Hero />
              <Section2Problem />
              <Section3Principle />
              <Section4Experiment />
              <UnifiedSurfaceProvider>
                <Section5Lab />
                <Section6Result />
              </UnifiedSurfaceProvider>
              <Section7Outro />
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
