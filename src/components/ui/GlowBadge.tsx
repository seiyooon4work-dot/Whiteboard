// amber/aqua 상태 배지 컴포넌트
// 색만으로 "문제 vs 좋음"을 전달하는 친절함 장치
import { motion, AnimatePresence } from 'motion/react'

interface GlowBadgeProps {
  type: 'amber' | 'aqua' | 'violet'
  children: React.ReactNode
  className?: string
  pulse?: boolean
}

export function GlowBadge({ type, children, className = '', pulse = false }: GlowBadgeProps) {
  const styles = {
    amber: {
      bg:     'rgba(255,138,61,0.12)',
      border: 'rgba(255,138,61,0.5)',
      text:   '#FFB870',
      shadow: '0 0 12px rgba(255,138,61,0.25)',
    },
    aqua: {
      bg:     'rgba(79,216,200,0.10)',
      border: 'rgba(79,216,200,0.45)',
      text:   '#7FEEE2',
      shadow: '0 0 12px rgba(79,216,200,0.22)',
    },
    violet: {
      bg:     'rgba(139,111,232,0.12)',
      border: 'rgba(139,111,232,0.4)',
      text:   '#B09EF5',
      shadow: '0 0 12px rgba(139,111,232,0.2)',
    },
  }[type]

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`no-split inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                  font-subtitle tracking-wider uppercase ${className}`}
      style={{
        background:  styles.bg,
        border:      `1px solid ${styles.border}`,
        color:       styles.text,
        boxShadow:   styles.shadow,
      }}
    >
      {pulse && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: styles.text, animation: 'pulse2 2s ease-in-out infinite' }}
        />
      )}
      {children}
    </motion.span>
  )
}

// 지움성 경고 배지 — 거칠기가 높을 때 표시
interface ErasabilityWarningProps {
  show: boolean
}
export function ErasabilityWarning({ show }: ErasabilityWarningProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <GlowBadge type="amber" pulse>
            ⚠ 잘 지워지지 않을 수 있어요
          </GlowBadge>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
