// 용어 툴팁 컴포넌트
// 전문 용어 위에 마우스를 올리면 쉬운 말 풀이 카드가 나타난다
import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'

interface TooltipProps {
  term: string
  definition: string
  children?: React.ReactNode
}

export function Tooltip({ term, definition, children }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setOpen(true)
  }
  const hide = () => {
    timerRef.current = setTimeout(() => setOpen(false), 120)
  }

  return (
    <span className="relative inline-block max-w-full align-top">
      <span
        className="tooltip-trigger inline-block cursor-help"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        tabIndex={0}
        aria-describedby={open ? 'tooltip-box' : undefined}
      >
        {children ?? term}
      </span>

      <AnimatePresence>
        {open && (
          <motion.span
            id="tooltip-box"
            role="tooltip"
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 block
                       w-56 p-3 rounded-xl text-left pointer-events-none"
            style={{
              background: 'rgba(13,17,32,0.97)',
              border: '1px solid rgba(79,216,200,0.35)',
              boxShadow: '0 0 24px rgba(79,216,200,0.15)',
            }}
          >
            <span className="block text-xs font-semibold text-aqua mb-1 font-subtitle tracking-wide uppercase">
              {term}
            </span>
            <span className="block text-xs text-ivory-dim leading-relaxed font-body">
              {definition}
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}
