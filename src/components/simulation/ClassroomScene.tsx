// 교실 2D 모션그래픽 씬 (SVG) — 실제 교실 평면도 구조
// 2행 4열 책상 배치: [1번][2번][3번][4번] 앞문 / [5번][6번][7번][8번] 뒷문 / [스탠딩 테이블]
// 마찰력·가독성 입력이 바뀔 때마다 빛 경로와 좌석 색이 실시간으로 전환된다
import { useMemo } from 'react'
import { motion } from 'motion/react'
import { type SimulationResult, visibilityToColor } from '../../lib/simulation'

interface ClassroomSceneProps {
  result: SimulationResult
}

// ── 레이아웃 상수 (SVG viewBox 0 0 140 108 기준) ─────────────────────────────
const WB   = { x: 14, y: 8, w: 88, h: 7, cx: 58 }   // 칠판 (가로 길게)
const LIGHT = { x: 58, y: 2 }                         // 천장 광원
const DW   = 20   // 책상 너비
const DH   = 14   // 책상 높이
// 4열 책상 왼쪽 x 좌표 (열 0~3, 왼쪽부터)
const COL_X = [9, 35, 61, 87]     // 각 열 책상 left-x
const COL_CX = [19, 45, 71, 97]   // 각 열 책상 center-x
const ROW_TOP = [34, 60]          // 1행·2행 책상 top-y
const ROW_CY  = [41, 67]          // 1행·2행 책상 center-y

// 2행 4열 배치 순서 (화면 왼→오른 순)
const DESK_ROWS: [number[], number[]] = [
  [1, 2, 3, 4],   // 1행 (앞)
  [5, 6, 7, 8],   // 2행 (뒤)
]

export function ClassroomScene({ result }: ClassroomSceneProps) {
  const { seats, r } = result

  // id → SeatResult 빠른 검색
  const seatMap = useMemo(() => {
    const m = new Map<number, typeof seats[number]>()
    seats.forEach(s => m.set(s.id, s))
    return m
  }, [seats])

  // ST(9번) 스탠딩 테이블
  const stSeat = seatMap.get(9)

  // 빛 경로: 광원 → 칠판 하단 → 각 좌석 (베지어 곡선)
  const rays = useMemo(() =>
    seats
      .filter(s => s.id !== 9)   // 스탠딩 테이블은 광선 제외
      .map(seat => {
        const cx1 = (LIGHT.x + WB.cx) / 2 + (seat.svgX - WB.cx) * 0.12
        const cy1 = (LIGHT.y + WB.y + WB.h) / 2
        const cx2 = (WB.cx + seat.svgX) / 2
        const cy2 = (WB.y + WB.h + seat.svgY) / 2 - 4
        return {
          id: seat.id,
          path: `M${LIGHT.x},${LIGHT.y} C${cx1},${cy1} ${cx2},${cy2} ${seat.svgX},${seat.svgY}`,
          glare: seat.glare,
          visibility: seat.visibility,
        }
      }),
  [seats])

  return (
    <div className="relative w-full max-w-sm mx-auto select-none" aria-label="교실 시뮬레이션 씬">
      <svg
        viewBox="0 0 140 108"
        className="w-full"
        style={{ filter: 'drop-shadow(0 0 24px rgba(79,216,200,0.08))' }}
      >
        {/* ── 교실 외곽 ──────────────────────────────────── */}
        <rect x="5" y="5" width="108" height="98" rx="3"
              fill="rgba(13,17,32,0.7)"
              stroke="rgba(46,63,102,0.8)" strokeWidth="0.8" />

        {/* ── 칠판 (상단 가로 길게) ──────────────────────── */}
        <rect x={WB.x} y={WB.y} width={WB.w} height={WB.h} rx="1.5"
              fill="rgba(68,170,68,0.75)"
              stroke="rgba(100,200,100,0.4)" strokeWidth="0.5" />
        <text x={WB.cx} y={WB.y + 5}
              textAnchor="middle" fontSize="3.8"
              fill="rgba(245,240,232,0.85)" fontFamily="Pretendard"
              fontWeight="600">
          칠판
        </text>

        {/* ── 천장 광원 ───────────────────────────────────── */}
        <motion.circle cx={LIGHT.x} cy={LIGHT.y} r="2.5"
          fill="rgba(245,240,232,0.9)"
          animate={{ r: [2.5, 3, 2.5], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <circle cx={LIGHT.x} cy={LIGHT.y} r="5"
                fill="rgba(245,240,232,0.05)" style={{ filter: 'blur(2px)' }} />

        {/* ── 빛 광선 ─────────────────────────────────────── */}
        {rays.map(ray => {
          const glareColor = ray.glare > 0.4
            ? `rgba(255,138,61,${(ray.glare * 0.5).toFixed(2)})`
            : `rgba(79,216,200,${(ray.visibility * 0.35).toFixed(2)})`
          return (
            <motion.path key={ray.id} d={ray.path} fill="none"
              stroke={glareColor}
              strokeWidth={ray.glare > 0.5 ? 0.75 : 0.4}
              animate={{ opacity: [0.3, 0.75, 0.3] }}
              transition={{
                duration: 3 + ray.id * 0.3,
                repeat: Infinity, ease: 'easeInOut',
                delay: ray.id * 0.12,
              }}
              style={{ filter: ray.glare > 0.5 ? 'blur(0.3px)' : 'none' }}
            />
          )
        })}

        {/* ── 난반사 팬 (거칠수록 넓게 퍼짐) ────────────── */}
        {r > 0.1 && Array.from({ length: Math.round(r * 6) + 2 }, (_, i) => {
          const total = Math.round(r * 6) + 2
          const angle = -55 + (i / (total - 1)) * 110
          const rad = (angle * Math.PI) / 180
          const ex = WB.cx + Math.sin(rad) * 28
          const ey = WB.y + WB.h + Math.cos(rad) * 22
          return (
            <motion.line key={`fan-${i}`}
              x1={WB.cx} y1={WB.y + WB.h / 2}
              x2={ex} y2={ey}
              stroke={`rgba(79,216,200,${(r * 0.20).toFixed(2)})`}
              strokeWidth="0.3"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
            />
          )
        })}

        {/* ── 2행 4열 책상 ────────────────────────────────── */}
        {DESK_ROWS.map((row, rowIdx) =>
          row.map((seatId, colIdx) => {
            const seat = seatMap.get(seatId)
            if (!seat) return null
            const x   = COL_X[colIdx]
            const y   = ROW_TOP[rowIdx]
            const cx  = COL_CX[colIdx]
            const cy  = ROW_CY[rowIdx]
            const color = visibilityToColor(seat.visibility)
            const isWeak = seat.visibility < 0.45
            return (
              <motion.g key={seatId}>
                {/* 글레어 경고 — 깜빡이는 테두리 */}
                {isWeak && (
                  <motion.rect
                    x={x - 1.5} y={y - 1.5}
                    width={DW + 3} height={DH + 3} rx="3"
                    fill="none"
                    stroke="rgba(255,138,61,0.55)" strokeWidth="0.7"
                    animate={{ opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2.2, repeat: Infinity }}
                  />
                )}

                {/* 책상 박스 */}
                <motion.rect x={x} y={y} width={DW} height={DH} rx="2"
                  animate={{ fill: color + '22' }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  stroke={color} strokeWidth="0.7"
                  style={{ filter: `drop-shadow(0 0 2px ${color}40)` }}
                />

                {/* 좌석 번호 (작게, 상단) */}
                <text x={cx} y={y + 5.5}
                      textAnchor="middle" fontSize="3.0"
                      fill="rgba(245,240,232,0.55)"
                      fontFamily="JetBrains Mono, monospace">
                  {seat.name}
                </text>

                {/* 가시성 점수 (크게, 하단) */}
                <motion.text x={cx} y={y + DH - 2.5}
                      textAnchor="middle" fontSize="4.2"
                      fontFamily="JetBrains Mono, monospace" fontWeight="700"
                      animate={{ fill: color }}
                      transition={{ duration: 0.5 }}>
                  {seat.visibilityScore.toFixed(1)}
                </motion.text>
              </motion.g>
            )
          })
        )}

        {/* ── 앞문 / 뒷문 레이블 ───────────────────────────── */}
        {/* 앞문 — 1행 오른쪽 */}
        <text x="116" y={ROW_CY[0] + 1.5}
              textAnchor="start" fontSize="3.2"
              fill="rgba(160,152,136,0.75)" fontFamily="Pretendard">
          앞문
        </text>
        {/* 뒷문 — 2행 오른쪽 */}
        <text x="116" y={ROW_CY[1] + 1.5}
              textAnchor="start" fontSize="3.2"
              fill="rgba(160,152,136,0.75)" fontFamily="Pretendard">
          뒷문
        </text>

        {/* ── 스탠딩 테이블 (맨 뒤, 가로 가득) ───────────── */}
        {(() => {
          const stColor = stSeat ? visibilityToColor(stSeat.visibility) : 'rgba(79,216,200,0.5)'
          const stScore = stSeat ? stSeat.visibilityScore.toFixed(1) : '—'
          return (
            <g>
              <motion.rect x="9" y="81" width="98" height="12" rx="2"
                animate={{ fill: stColor + '18' }}
                transition={{ duration: 0.6 }}
                stroke={stColor} strokeWidth="0.6"
              />
              <text x="58" y="89.5" textAnchor="middle"
                    fontSize="3.5" fill="rgba(245,240,232,0.65)"
                    fontFamily="Pretendard">
                {`스탠딩 테이블  ${stScore}`}
              </text>
            </g>
          )
        })()}

        {/* ── 하단 상태 텍스트 ──────────────────────────────── */}
        <text x="7" y="105" fontSize="2.3"
              fill="rgba(160,152,136,0.5)" fontFamily="Space Grotesk">
          {r < 0.3 ? '정반사 → 번쩍임 강함' : r > 0.65 ? '난반사 → 균일하게 잘 보임' : '정반사·난반사 혼재'}
        </text>
      </svg>

      {/* ── 범례 ─────────────────────────────────────────── */}
      <div className="flex justify-center gap-5 mt-2 text-xs font-subtitle">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ background: '#FF8A3D' }} />
          <span style={{ color: 'var(--ivory-dim)' }}>번쩍임·안 보임</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ background: '#4FD8C8' }} />
          <span style={{ color: 'var(--ivory-dim)' }}>잘 보임</span>
        </span>
      </div>
    </div>
  )
}
