// 섹션 2 — 문제
// "당신의 자리에서는 칠판이 잘 보이나요?"
// 설문 결과: 91.7% / 교실 좌석 히트맵 / 원인 막대그래프
import { motion } from 'motion/react'
import { useInView } from '../hooks/useInView'
import { CountUp } from '../components/ui/CountUp'
import { Tooltip } from '../components/ui/Tooltip'
import { SURVEY_DATA } from '../data/materials'

export function Section2Problem() {
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.15 })

  return (
    <section id="problem" ref={ref} className="relative section-pad">
      <div className="max-w-5xl mx-auto">
        {/* 섹션 라벨 */}
        <motion.p
          className="section-label mb-4"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          02 — 문제 인식
        </motion.p>

        <motion.h2
          className="font-display font-bold mb-3"
          style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', color: 'var(--ivory)' }}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          당신의 자리에서는<br />칠판이 잘 보이나요?
        </motion.h2>

        <motion.p
          className="text-base max-w-lg mb-8"
          style={{ color: 'var(--ivory-dim)' }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          이건 개인의 문제가 아닙니다. <strong style={{ color: 'var(--ivory)' }}>교실 구조의 문제</strong>입니다.
          2학년 전교생 약 120명을 대상으로 설문한 결과입니다.
        </motion.p>

        {/* 큰 숫자 */}
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          <div className="flex flex-col gap-2">
            <motion.div
              className="font-display font-black leading-none"
              style={{ fontSize: 'clamp(5rem, 18vw, 11rem)' }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            >
              <span className="gradient-text-aqua">
                <CountUp to={91.7} decimals={1} suffix="%" trigger={inView} />
              </span>
            </motion.div>
            <motion.p
              className="text-sm font-body max-w-xs"
              style={{ color: 'var(--ivory-dim)' }}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8 }}
            >
              "수업 중{' '}
              <Tooltip term="가시성" definition="눈으로 볼 수 있는 정도. 화이트보드 글씨가 얼마나 선명하게 보이는지를 뜻합니다.">
                <span>화이트보드가 잘 안 보인</span>
              </Tooltip>{' '}
              적이 있다"고 응답한 학생 비율
            </motion.p>
          </div>

          {/* 원인 막대그래프 */}
          <div className="flex-1 w-full">
            <p className="text-xs font-subtitle font-semibold tracking-widest uppercase mb-4"
               style={{ color: 'var(--ivory-dim)' }}>
              가시성 방해 원인
            </p>
            <div className="flex flex-col gap-3">
              {SURVEY_DATA.causes.map((cause, i) => (
                <motion.div
                  key={cause.label}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="w-[4.5rem] flex-shrink-0 text-right text-[11px] font-body sm:w-24 sm:text-xs"
                        style={{ color: 'var(--ivory-dim)' }}>
                    {cause.label}
                  </span>
                  <div className="relative min-w-0 flex-1 h-5 rounded-full"
                       style={{ background: 'rgba(46,63,102,0.4)' }}>
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ background: cause.color + 'CC' }}
                      initial={{ width: 0 }}
                      animate={inView ? { width: `${cause.percent}%` } : { width: 0 }}
                      transition={{ delay: 0.6 + i * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    />
                    <motion.span
                      className="absolute top-1/2 -translate-y-1/2 pl-2 text-xs font-mono font-bold"
                      style={{
                        left: `${cause.percent}%`,
                        color: 'var(--ivory)',
                        textShadow: '0 1px 6px rgba(13,17,32,0.9)',
                      }}
                      initial={{ opacity: 0 }}
                      animate={inView ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ delay: 0.95 + i * 0.1, duration: 0.35 }}
                    >
                      {cause.percent}%
                    </motion.span>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-xs mt-3" style={{ color: 'var(--ivory-dim)' }}>
              * 가장 큰 원인은{' '}
              <Tooltip term="빛 반사" definition="화이트보드 표면이 거울처럼 빛을 한 방향으로 튕겨내는 현상입니다. 특정 자리에서 글씨가 빛에 가려 보이지 않게 됩니다.">
                <span>빛 반사</span>
              </Tooltip>
              (34.6%) 였습니다.
            </p>
          </div>
        </div>

        {/* 교실 평면도 히트맵 */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-xs font-subtitle font-semibold tracking-widest uppercase mb-5"
             style={{ color: 'var(--ivory-dim)' }}>
            잘 안 보인 자리 (복수 응답)
          </p>
          <ClassroomHeatmap inView={inView} />
        </motion.div>
      </div>
    </section>
  )
}

// 교실 평면도 히트맵 (설문 데이터 시각화) — 실제 교실 구조 반영
// 2행 4열: [1번][2번][3번][4번] 앞문 / [5번][6번][7번][8번] 뒷문 / [스탠딩 테이블]
function ClassroomHeatmap({ inView }: { inView: boolean }) {
  const seatData = SURVEY_DATA.seatComplaints

  // 2행 4열 책상 배치 (화면 왼→오른 순, 각 열의 seat id)
  const ROWS = [
    [1, 2, 3, 4],   // 1행 앞
    [5, 6, 7, 8],   // 2행 뒤
  ]

  // SVG 레이아웃 상수 (viewBox 0 0 148 110)
  const DW = 22   // 책상 너비
  const DH = 15   // 책상 높이
  const COL_X  = [8, 34, 60, 86]      // 각 열 left-x
  const COL_CX = [19, 45, 71, 97]     // 각 열 center-x
  const ROW_TOP = [36, 61]             // 각 행 top-y
  const ROW_CY  = [43.5, 68.5]        // 각 행 center-y

  // 색상 계산: 0% → aqua, 높을수록 → amber
  function heatColor(pct: number) {
    const ratio = Math.min(pct / 50, 1)
    const r = Math.round(79  + (255 - 79)  * ratio)
    const g = Math.round(216 + (138 - 216) * ratio)
    const b = Math.round(200 + (61  - 200) * ratio)
    return `rgb(${r},${g},${b})`
  }

  return (
    <div className="max-w-lg glass-card p-4">
      <svg viewBox="0 0 148 110" className="w-full">

        {/* 교실 외곽 */}
        <rect x="5" y="5" width="110" height="100" rx="3"
              fill="rgba(13,17,32,0.6)"
              stroke="rgba(46,63,102,0.6)" strokeWidth="0.7" />

        {/* 칠판 (상단 녹색, 가로 길게) */}
        <rect x="9" y="8" width="102" height="7" rx="1.5"
              fill="rgba(68,170,68,0.75)"
              stroke="rgba(100,200,100,0.35)" strokeWidth="0.4" />
        <text x="60" y="13" textAnchor="middle"
              fontSize="3.8" fill="rgba(245,240,232,0.85)"
              fontFamily="Pretendard" fontWeight="600">
          칠판
        </text>

        {/* 책상 (2행 4열) */}
        {ROWS.map((row, rowIdx) =>
          row.map((seatId, colIdx) => {
            const complaint = seatData.find(s => s.id === seatId)
            const pct = complaint?.percent ?? 0
            const color = heatColor(pct)
            const x  = COL_X[colIdx]
            const y  = ROW_TOP[rowIdx]
            const cx = COL_CX[colIdx]
            const cy = ROW_CY[rowIdx]
            const isHot = pct > 20

            return (
              <motion.g key={seatId}>
                {/* 고열 자리 — 깜빡이는 경고 테두리 */}
                {isHot && (
                  <motion.rect
                    x={x - 1.5} y={y - 1.5}
                    width={DW + 3} height={DH + 3} rx="3"
                    fill="none" stroke={color} strokeWidth="0.6"
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: [0.7, 0, 0.7] } : { opacity: 0 }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: colIdx * 0.15 }}
                  />
                )}

                {/* 책상 박스 */}
                <motion.rect
                  x={x} y={y} width={DW} height={DH} rx="2"
                  fill={color + '22'}
                  stroke={color} strokeWidth="0.7"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
                  transition={{
                    delay: 0.7 + (rowIdx * 4 + colIdx) * 0.08,
                    duration: 0.5, ease: [0.34, 1.56, 0.64, 1],
                  }}
                  style={{
                    transformOrigin: `${cx}px ${cy}px`,
                    filter: `drop-shadow(0 0 3px ${color}50)`,
                  }}
                />

                {/* 좌석 번호 */}
                <text x={cx} y={y + 5.5}
                      textAnchor="middle" fontSize="3"
                      fill="rgba(245,240,232,0.6)"
                      fontFamily="JetBrains Mono" fontWeight="600">
                  {seatId}번
                </text>

                {/* 불만 비율 */}
                <motion.text
                  x={cx} y={y + DH - 2.5}
                  textAnchor="middle" fontSize="3.6"
                  fill={color}
                  fontFamily="JetBrains Mono" fontWeight="700"
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: 1 + (rowIdx * 4 + colIdx) * 0.08 }}
                >
                  {pct > 0 ? `${pct}%` : '0%'}
                </motion.text>
              </motion.g>
            )
          })
        )}

        {/* 앞문 레이블 */}
        <text x="118" y={ROW_CY[0] + 1}
              textAnchor="start" fontSize="3.2"
              fill="rgba(160,152,136,0.75)" fontFamily="Pretendard">
          앞문
        </text>
        {/* 뒷문 레이블 */}
        <text x="118" y={ROW_CY[1] + 1}
              textAnchor="start" fontSize="3.2"
              fill="rgba(160,152,136,0.75)" fontFamily="Pretendard">
          뒷문
        </text>

        {/* 스탠딩 테이블 */}
        {(() => {
          const st = seatData.find(s => s.id === 9)
          const pct = st?.percent ?? 0
          const color = heatColor(pct)
          return (
            <motion.g>
              <motion.rect x="8" y="82" width="100" height="12" rx="2"
                fill={color + '18'} stroke={color} strokeWidth="0.6"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 1.4 }}
              />
              <text x="58" y="90" textAnchor="middle"
                    fontSize="3.5" fill="rgba(245,240,232,0.65)"
                    fontFamily="Pretendard">
                {`스탠딩 테이블  ${pct > 0 ? pct + '%' : '0%'}`}
              </text>
            </motion.g>
          )
        })()}

        {/* 범례 */}
        <text x="7" y="103" fontSize="2.3"
              fill="rgba(160,152,136,0.55)" fontFamily="Space Grotesk">
          아쿠아(0%) → 앰버(높음)
        </text>
      </svg>
      <p className="text-xs mt-2 text-center" style={{ color: 'var(--ivory-dim)' }}>
        ↑ 앰버일수록 "잘 안 보인다"는 응답이 많은 자리 (복수 응답, %)
      </p>
    </div>
  )
}
