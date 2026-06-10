// 고정 진행 표시기
// 사용자가 항상 "지금 어디 있는지" 알 수 있는 친절함 장치
// 화면 오른쪽에 세로로 고정. 섹션 이름 + 점으로 구성.
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const SECTIONS = [
  { id: 'hero',       label: '도입' },
  { id: 'problem',    label: '문제' },
  { id: 'principle',  label: '원리' },
  { id: 'experiment', label: '실험' },
  { id: 'lab',        label: '시뮬레이션' },
  { id: 'result',     label: '결과' },
  { id: 'outro',      label: '마무리' },
]

export function ProgressNav() {
  const [active, setActive] = useState('hero')
  const [hovered, setHovered] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
            setVisible(entry.target.id !== 'hero' ? true : false)
          }
        })
      },
      { threshold: 0.4, rootMargin: '-10% 0px -10% 0px' }
    )

    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed right-2 top-1/2 z-50 flex -translate-y-1/2 flex-col items-end gap-2.5 sm:right-5 sm:gap-3"
          aria-label="페이지 진행 표시"
        >
          {SECTIONS.map(s => {
            const isActive = active === s.id
            return (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
                className="group flex min-h-8 min-w-8 items-center justify-end gap-2.5"
                aria-label={`${s.label} 섹션으로 이동`}
                aria-current={isActive ? 'true' : undefined}
              >
                {/* 라벨 (hover 시 나타남) */}
                <AnimatePresence>
                  {hovered === s.id && (
                    <motion.span
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 6 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs font-subtitle font-semibold tracking-wider uppercase"
                      style={{ color: isActive ? '#4FD8C8' : '#A09888' }}
                    >
                      {s.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* 진행 점 */}
                <motion.span
                  animate={{
                    scale:      isActive ? 1.5 : 1,
                    background: isActive ? '#4FD8C8' : hovered === s.id ? '#7FEEE2' : '#2E3F66',
                    boxShadow:  isActive ? '0 0 8px rgba(79,216,200,0.6)' : 'none',
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="block w-1.5 h-1.5 rounded-full flex-shrink-0"
                />
              </button>
            )
          })}
        </motion.nav>
      )}
    </AnimatePresence>
  )
}
