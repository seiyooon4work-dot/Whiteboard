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
    let frameId = 0

    const updateActiveSection = () => {
      frameId = 0
      const viewportCenter = window.innerHeight / 2
      const sections = SECTIONS.map(section => document.getElementById(section.id)).filter(
        (section): section is HTMLElement => section !== null,
      )

      const current =
        sections.find(section => {
          const rect = section.getBoundingClientRect()
          return rect.top <= viewportCenter && rect.bottom > viewportCenter
        }) ??
        sections.reduce<HTMLElement | null>((closest, section) => {
          if (!closest) return section
          const distance = Math.abs(section.getBoundingClientRect().top - viewportCenter)
          const closestDistance = Math.abs(closest.getBoundingClientRect().top - viewportCenter)
          return distance < closestDistance ? section : closest
        }, null)

      if (current) {
        setActive(current.id)
        setVisible(current.id !== 'hero')
      }
    }

    const requestUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(updateActiveSection)
    }

    updateActiveSection()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      if (frameId) window.cancelAnimationFrame(frameId)
    }
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <AnimatePresence>
      {visible && (
        <div className="progress-nav fixed top-1/2 z-50 -translate-y-1/2 sm:right-5">
          <motion.nav
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-end gap-1 sm:gap-3"
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
                  className="progress-nav__button group flex items-center justify-end gap-2.5"
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
                        className="hidden text-xs font-subtitle font-semibold tracking-wider uppercase sm:block"
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
                    className="progress-nav__dot block flex-shrink-0 rounded-full"
                  />
                </button>
              )
            })}
          </motion.nav>
        </div>
      )}
    </AnimatePresence>
  )
}
