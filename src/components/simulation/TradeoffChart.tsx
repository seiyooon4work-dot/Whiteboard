// 트레이드오프 곡선 SVG 차트
// 가로: 마찰계수 μ / 세로: 종합 품질
// 현재 입력 위치 + 최적 지점을 실시간으로 표시
import { useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { type CurvePoint } from '../../lib/simulation'

interface TradeoffChartProps {
  curveData: CurvePoint[]
  currentMu: number
  currentQuality: number
  optimalMu?: number | null
  optimalQuality?: number | null
}

// SVG 좌표 변환
const PAD = { l: 32, r: 18, t: 14, b: 28 }
const W = 320
const H = 170
const innerW = W - PAD.l - PAD.r
const innerH = H - PAD.t - PAD.b

const toX = (mu: number)      => PAD.l + ((mu - 0.05) / 0.95) * innerW
const toY = (quality: number) => PAD.t + (1 - quality / 100) * innerH

export function TradeoffChart({
  curveData, currentMu, currentQuality, optimalMu, optimalQuality,
}: TradeoffChartProps) {
  // SVG 경로 문자열 생성
  const pathD = useMemo(() => {
    if (!curveData.length) return ''
    const pts = curveData.map(d => `${toX(d.mu).toFixed(1)},${toY(d.quality).toFixed(1)}`)
    return 'M' + pts.join(' L')
  }, [curveData])

  // 면적 채우기 경로
  const areaD = useMemo(() => {
    if (!curveData.length) return ''
    const pts = curveData.map(d => `${toX(d.mu).toFixed(1)},${toY(d.quality).toFixed(1)}`)
    return `M${toX(0.05)},${toY(0)} L` + pts.join(' L') + ` L${toX(1.00)},${toY(0)} Z`
  }, [curveData])

  const cx = toX(currentMu)
  const cy = toY(currentQuality)

  const ox = optimalMu   != null ? toX(optimalMu) : null
  const oy = optimalQuality != null ? toY(optimalQuality) : null

  return (
    <div className="w-full overflow-hidden rounded-xl"
         style={{ background: 'rgba(13,17,32,0.6)', border: '1px solid rgba(46,63,102,0.5)' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="마찰계수와 종합 품질의 트레이드오프 곡선"
      >
        {/* 그리드 선 */}
        {[0, 25, 50, 75, 100].map(v => (
          <g key={v}>
            <line
              x1={PAD.l} y1={toY(v)}
              x2={W - PAD.r} y2={toY(v)}
              stroke="rgba(46,63,102,0.35)" strokeWidth="0.5"
              strokeDasharray="3,4"
            />
            <text
              x={PAD.l - 4} y={toY(v) + 3.5}
              textAnchor="end" fontSize="8"
              fill="rgba(160,152,136,0.6)"
              fontFamily="JetBrains Mono, monospace"
            >
              {v}
            </text>
          </g>
        ))}

        {/* 면적 그라디언트 fill */}
        <defs>
          <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#4FD8C8" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#4FD8C8" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#area-grad)" />

        {/* 주 곡선 */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="#4FD8C8"
          strokeWidth="1.8"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: 'drop-shadow(0 0 4px rgba(79,216,200,0.5))' }}
        />

        {/* 지움성 보조선 */}
        {curveData.length > 0 && (() => {
          const erasePts = curveData.map(d =>
            `${toX(d.mu).toFixed(1)},${toY(d.erasability).toFixed(1)}`
          )
          return (
            <path
              d={'M' + erasePts.join(' L')}
              fill="none"
              stroke="rgba(255,138,61,0.35)"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          )
        })()}

        {/* 최적 지점 강조 */}
        <AnimatePresence>
          {ox != null && oy != null && (
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{ transformOrigin: `${ox}px ${oy}px` }}
            >
              <motion.circle
                cx={ox} cy={oy} r="7"
                fill="rgba(79,216,200,0.12)"
                animate={{ r: [7, 12, 7], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <circle cx={ox} cy={oy} r="4"
                      fill="#4FD8C8"
                      style={{ filter: 'drop-shadow(0 0 6px rgba(79,216,200,0.8))' }} />
              <text x={ox} y={oy - 9} textAnchor="middle"
                    fontSize="7" fill="#7FEEE2"
                    fontFamily="Space Grotesk, Pretendard, sans-serif" fontWeight="600">
                최적
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* 현재 위치 점 */}
        <motion.circle
          cx={cx} cy={cy} r="5"
          animate={{ cx, cy }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          fill="var(--ivory)"
          style={{ filter: 'drop-shadow(0 0 5px rgba(245,240,232,0.6))' }}
        />
        <motion.circle
          cx={cx} cy={cy} r="2.5"
          animate={{ cx, cy }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          fill="var(--bg-void)"
        />

        {/* X축 */}
        <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b}
              stroke="rgba(46,63,102,0.6)" strokeWidth="0.8" />
        {[0.2, 0.4, 0.6, 0.8, 1.0].map(v => (
          <text key={v}
                x={toX(v)} y={H - PAD.b + 10}
                textAnchor="middle" fontSize="7.5"
                fill="rgba(160,152,136,0.55)"
                fontFamily="JetBrains Mono, monospace">
            {v.toFixed(1)}
          </text>
        ))}

        {/* 축 라벨 */}
        <text x={W / 2} y={H - 1} textAnchor="middle"
              fontSize="7" fill="rgba(160,152,136,0.5)"
              fontFamily="Space Grotesk, Pretendard, sans-serif" letterSpacing="1.5">
          마찰계수 μ
        </text>
        <text x={9} y={H / 2}
              fontSize="7" fill="rgba(160,152,136,0.5)"
              fontFamily="Space Grotesk, Pretendard, sans-serif" letterSpacing="1.5"
              transform={`rotate(-90 9 ${H / 2})`}
              textAnchor="middle">
          품질 점수
        </text>

        {/* 범례 */}
        <line x1={W - 95} y1={12} x2={W - 80} y2={12}
              stroke="#4FD8C8" strokeWidth="1.5" />
        <text x={W - 77} y={15.5} fontSize="7" fill="rgba(160,152,136,0.7)"
              fontFamily="Space Grotesk, Pretendard, sans-serif">종합 품질</text>
        <line x1={W - 95} y1={22} x2={W - 80} y2={22}
              stroke="rgba(255,138,61,0.5)" strokeWidth="1" strokeDasharray="3,3" />
        <text x={W - 77} y={25.5} fontSize="7" fill="rgba(160,152,136,0.7)"
              fontFamily="Space Grotesk, Pretendard, sans-serif">지움성</text>
      </svg>
    </div>
  )
}
