// ─── src/lib/simulation.ts ───────────────────────────────────────────────────
// 화이트보드 가시성 시뮬레이션 핵심 계산 로직
// UI와 완전히 분리된 순수 함수 모음
// HAFS Eureka 연구 프로젝트 — 교실 화이트보드 가시성 개선 연구, 2026
import { MEASURED_MATERIALS, measuredToRegressionMaterial } from './materialData'

// ─── 타입 정의 ────────────────────────────────────────────────────────────────

/** 각 좌석의 시뮬레이션 결과 */
export interface SeatResult {
  id: number
  name: string
  /** 정반사 방향에서 벗어난 각도 (라디안). 작을수록 정반사 방향에 가깝다 */
  deltaTheta: number
  /** 글레어(번쩍임) 강도 0~1. 1에 가까울수록 번쩍임이 심하다 */
  glare: number
  /** 가시성 0~1. 1에 가까울수록 잘 보인다 */
  visibility: number
  /** 가시성 0~10 스케일 (표시용) */
  visibilityScore: number
  /** 설문에서 "안 보인다" 응답 비율 (참고용) */
  surveyPercent: number
  /** 실제 측정 가시성 점수 0~10 (우드락 기준 실측값) */
  measuredScore: number
  /** SVG 좌표 (0~100 기준, 교실 평면도용) */
  svgX: number
  svgY: number
}

/** 사용자가 직접 조절하는 표면 구조 지수와 회귀식으로 계산된 기준 점수 */
export interface SimulationInputs {
  /** 표면의 홈과 요철 정도. 클수록 거친 표면 */
  surfaceStructureIndex: number
  /** 주관적 가시성 점수 0~10 */
  visibility: number
  /** 객관적 가시성 점수 0~100 */
  objectiveVisibility: number
  /** 지움성 점수 0~100 */
  erasability: number
  /** 기존 최종 적합도 계산에 쓰는 보조 점수 0~100 */
  frictionFit: number
  /** 표면 구조 지수를 0~100으로 환산한 값 */
  surfaceStructure: number
}

export interface RegressionPrediction {
  surfaceStructureIndex: number
  subjectiveVisibility: number
  objectiveVisibility: number
  erasability: number
  subjectiveVisibilityScaled: number
}

export interface RegressionMaterial {
  id: string
  name: string
  surfaceStructureIndex: number
  subjectiveVisibility: number
  objectiveVisibility: number
  erasability: number
}

/** 시뮬레이션 전체 결과 */
export interface SimulationResult {
  /** 입력 점수 */
  inputs: SimulationInputs
  /** 사용자가 입력한 원래 기준 점수 */
  rawInputs: SimulationInputs
  /** 거칠기 지수 0~1 (마찰계수 μ를 정규화한 값) */
  r: number
  /** 난반사 비율 0~1 */
  D: number
  /** 정반사 비율 0~1 */
  S: number
  /** 빛 확산폭 (라디안). r이 클수록 커진다 */
  psi: number
  /** 지움성 0~1. 거칠수록 낮다 */
  erasability: number
  /** 표면 구조에서 계산한 지움성 점수 0~100 */
  simulatedErasabilityScore: number
  /** 입력값과 시뮬레이션값을 가중평균한 지움성 점수 0~100 */
  weightedErasabilityScore: number
  /** 마찰 적정성 0~1 */
  frictionFit: number
  /** 표면 구조 점수 0~1 */
  surfaceStructure: number
  /** 좌석별 결과 */
  seats: SeatResult[]
  /** 전체 평균 가시성 0~1 */
  avgVisibility: number
  /** 종합 품질 0~100 */
  qualityScore: number
  /** 지움성 경고 (거칠기가 높아 마카가 잘 안 지워질 수 있을 때 true) */
  erasabilityWarning: boolean
  /** 결과 해석 한국어 문장 */
  interpretText: string
  /** 표면 구조 지수 기반 회귀 예측값 */
  regression: RegressionPrediction
}

/** 최적화 실행 결과 (SimulationResult 확장) */
export interface OptimalResult extends SimulationResult {
  /** 권장 입력값 */
  optimalInputs: SimulationInputs
  /** 최적 품질 점수 */
  optimalQuality: number
}

/** 트레이드오프 곡선 한 점 */
export interface CurvePoint {
  mu: number
  quality: number
  erasability: number
  avgVis: number
}

export const SURFACE_STRUCTURE_RANGE = {
  min: 0.03,
  max: 6.15,
} as const

export const REGRESSION_MATERIALS: RegressionMaterial[] =
  MEASURED_MATERIALS.map(measuredToRegressionMaterial)

export const REGRESSION_FORMULAS = {
  subjectiveVisibility: { intercept: 5.228, slope: 0.292 },
  objectiveVisibility: { intercept: 47.539, slope: 6.539 },
  erasability: { intercept: 68.768, slope: -10.190 },
} as const

export const QUALITY_EXPONENTS = {
  objectiveVisibility: 0.4,
  erasability: 0.3,
  frictionFit: 0.2,
  structureScore: 0.1,
  weakestPenalty: 0.7,
} as const

export const ERASABILITY_WEIGHTS = {
  inputScore: 0.7,
  simulationScore: 0.3,
} as const

export function clampRange(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

export function predictFromSurfaceStructureIndex(x: number): RegressionPrediction {
  const surfaceStructureIndex = clampRange(
    x,
    SURFACE_STRUCTURE_RANGE.min,
    SURFACE_STRUCTURE_RANGE.max
  )
  const subjectiveVisibility = clampRange(
    REGRESSION_FORMULAS.subjectiveVisibility.intercept +
      REGRESSION_FORMULAS.subjectiveVisibility.slope * surfaceStructureIndex,
    0,
    10
  )
  const objectiveVisibility = clampRange(
    REGRESSION_FORMULAS.objectiveVisibility.intercept +
      REGRESSION_FORMULAS.objectiveVisibility.slope * surfaceStructureIndex,
    0,
    100
  )
  const erasability = clampRange(
    REGRESSION_FORMULAS.erasability.intercept +
      REGRESSION_FORMULAS.erasability.slope * surfaceStructureIndex,
    0,
    100
  )

  return {
    surfaceStructureIndex,
    subjectiveVisibility,
    objectiveVisibility,
    erasability,
    subjectiveVisibilityScaled: subjectiveVisibility * 10,
  }
}

export function surfaceIndexToStructureScore(x: number): number {
  const normalized = (
    clampRange(x, SURFACE_STRUCTURE_RANGE.min, SURFACE_STRUCTURE_RANGE.max) -
    SURFACE_STRUCTURE_RANGE.min
  ) / (SURFACE_STRUCTURE_RANGE.max - SURFACE_STRUCTURE_RANGE.min)
  return normalized * 100
}

export function erasabilityFromSurfaceStructureSoft(x: number): number {
  const normalized = (
    clampRange(x, SURFACE_STRUCTURE_RANGE.min, SURFACE_STRUCTURE_RANGE.max) -
    SURFACE_STRUCTURE_RANGE.min
  ) / (SURFACE_STRUCTURE_RANGE.max - SURFACE_STRUCTURE_RANGE.min)
  return Math.max(0, Math.min(100, 100 * (1 - Math.pow(normalized, 1 / 1.35))))
}

export function inputsFromSurfaceStructureIndex(x: number): SimulationInputs {
  const regression = predictFromSurfaceStructureIndex(x)
  return {
    surfaceStructureIndex: regression.surfaceStructureIndex,
    visibility: regression.subjectiveVisibility,
    objectiveVisibility: regression.objectiveVisibility,
    erasability: regression.erasability,
    frictionFit: clampScore(100 - Math.abs(surfaceIndexToStructureScore(regression.surfaceStructureIndex) - 48) * 0.7),
    surfaceStructure: surfaceIndexToStructureScore(regression.surfaceStructureIndex),
  }
}

// ─── 좌석 배치 데이터 ────────────────────────────────────────────────────────
// 설문 결과(1·7·8번 취약, 3번 최우수)와 대체로 일치하도록
// deltaTheta(정반사 방향에서 벗어난 각도) 값을 배치
// 작은 deltaTheta → 정반사 방향에 가까움 → 글레어 강함 → 안 보임
// 큰 deltaTheta   → 정반사 방향에서 멀리 → 글레어 약함 → 잘 보임

// 실제 교실 배치: 2행 4열 + 스탠딩 테이블
//   화면: [1번][2번][3번][4번] 앞문
//         [5번][6번][7번][8번] 뒷문
//         [─── 스탠딩 테이블 ───]
// SVG 좌표 기준 (viewBox 0 0 140 108)
// svgX/svgY = 책상 중심점
export const SEATS_CONFIG = [
  // 1번 — 왼쪽 앞. 측정 3.7
  { id: 1, name: '1번', deltaTheta: 0.08,  surveyPercent: 35.8, measuredScore: 3.7,  svgX: 19,  svgY: 41 },
  // 2번 — 중앙 왼쪽 앞. 측정 10.0
  { id: 2, name: '2번', deltaTheta: 1.05,  surveyPercent: 0,    measuredScore: 10.0, svgX: 45,  svgY: 41 },
  // 3번 — 중앙 오른쪽 앞. 측정 9.6
  { id: 3, name: '3번', deltaTheta: 0.85,  surveyPercent: 0,    measuredScore: 9.6,  svgX: 71,  svgY: 41 },
  // 4번 — 오른쪽 앞. 측정 4.2
  { id: 4, name: '4번', deltaTheta: 0.15,  surveyPercent: 44.2, measuredScore: 4.2,  svgX: 97,  svgY: 41 },
  // 5번 — 왼쪽 뒤. 측정 5.9
  { id: 5, name: '5번', deltaTheta: 0.62,  surveyPercent: 27.5, measuredScore: 5.9,  svgX: 19,  svgY: 67 },
  // 6번 — 중앙 왼쪽 뒤. 측정 8.4
  { id: 6, name: '6번', deltaTheta: 0.65,  surveyPercent: 0.8,  measuredScore: 8.4,  svgX: 45,  svgY: 67 },
  // 7번 — 중앙 오른쪽 뒤. 측정 8.2
  { id: 7, name: '7번', deltaTheta: 0.62,  surveyPercent: 11.7, measuredScore: 8.2,  svgX: 71,  svgY: 67 },
  // 8번 — 오른쪽 뒤. 측정 5.7
  { id: 8, name: '8번', deltaTheta: 0.32,  surveyPercent: 12.5, measuredScore: 5.7,  svgX: 97,  svgY: 67 },
  // ST  — 스탠딩 테이블 (맨 뒤 중앙). 측정 7.6
  { id: 9, name: 'ST',  deltaTheta: 0.72,  surveyPercent: 7.5,  measuredScore: 7.6,  svgX: 58,  svgY: 87 },
] as const

// ─── 핵심 계산 함수 ──────────────────────────────────────────────────────────

/**
 * 마찰계수 μ를 거칠기 지수 r (0~1)로 정규화
 * μ 입력 범위: 0.05 ~ 1.00
 */
export function normalizeRoughness(mu: number): number {
  const MU_MIN = 0.05
  const MU_MAX = 1.00
  return Math.max(0, Math.min(1, (mu - MU_MIN) / (MU_MAX - MU_MIN)))
}

/**
 * 거칠기 지수 r로 난반사(D)·정반사(S) 비율 계산
 *
 * 원리: 지수 함수로 매끄러움(r=0) → 거침(r=1)에 따라 변화
 *   r=0(매끄): D≈0,   S≈1  → 정반사 강함 → 특정 자리 번쩍임 심함
 *   r=1(거침): D≈0.95, S≈0.05 → 난반사 강함 → 고른 가시성
 */
export function calcReflectance(r: number): { D: number; S: number } {
  const D = 1 - Math.exp(-3 * r)
  const S = 1 - D
  return { D, S }
}

/**
 * 빛 확산폭 ψ 계산
 * 거칠수록 반사광이 더 넓은 각도로 퍼진다
 * 범위: 0.15 (매끄) ~ 0.80 (거침) 라디안
 */
export function calcSpread(r: number): number {
  return 0.15 + 0.65 * r
}

/**
 * 특정 좌석의 글레어(번쩍임) 강도 계산
 * 가우시안 분포: 정반사 방향에 가까울수록 글레어가 강하다
 *
 * @param S         정반사 비율
 * @param deltaTheta 정반사 방향에서 벗어난 각도 (라디안)
 * @param psi       확산폭 (라디안). r이 클수록 가우시안이 넓어진다
 */
export function calcSeatGlare(S: number, deltaTheta: number, psi: number): number {
  return S * Math.exp(-(deltaTheta ** 2) / (2 * psi ** 2))
}

/**
 * 특정 좌석의 가시성 점수 계산 (0~1)
 *
 * @param baseContrast 기본 대비 = 가독성 점수 / 10 (0~1)
 * @param D           난반사 비율
 * @param glare       글레어 강도
 * @param r           거칠기 지수 (거칠수록 마카 흡수력이 약간 감소 → 미세 감점)
 */
export function calcSeatVisibility(
  baseContrast: number,
  D: number,
  glare: number,
  r: number,
  measuredScore: number,
  frictionFit: number
): number {
  // 실제 측정값의 좌석별 패턴을 기준으로 두고, 입력값은 전체 수준을 조절한다.
  // 이렇게 해야 좋은 표면에서도 모든 좌석이 같은 점수로 뭉개지지 않는다.
  const measuredBaseline = measuredScore / 10
  const calibratedSeat = 0.48 + 0.52 * measuredBaseline
  const sceneLevel = 0.58 + 0.42 * baseContrast
  const structureLift = 0.9 + 0.1 * D
  const frictionLift = 0.95 + 0.05 * frictionFit
  const glarePenalty = 1 - 0.18 * glare
  const roughnessPenalty = 1 - 0.04 * r
  const raw = calibratedSeat
    * sceneLevel
    * structureLift
    * frictionLift
    * glarePenalty
    * roughnessPenalty
  return Math.max(0, Math.min(1, raw))
}

/**
 * 지움성 계산: 거칠수록 마카가 홈에 끼어 잘 안 지워진다
 *
 * E = 1 / (1 + 3r)
 *   r=0(매끄): E≈1.00   → 잘 지워짐
 *   r=0.5:    E≈0.40   → 보통
 *   r=1(거침): E≈0.25   → 잘 안 지워짐
 */
export function calcErasability(r: number): number {
  return 1 / (1 + 3 * r)
}

export function calcWeightedErasabilityScore(inputScore: number, surfaceStructure: number): number {
  const r = Math.max(0, Math.min(100, surfaceStructure)) / 100
  const simulatedScore = calcErasability(r) * 100
  return Math.max(0, Math.min(100,
    ERASABILITY_WEIGHTS.inputScore * Math.max(0, Math.min(100, inputScore)) +
    ERASABILITY_WEIGHTS.simulationScore * simulatedScore
  ))
}

/**
 * 구조 균형 점수: 너무 매끄럽거나 너무 거친 극단만 약하게 감점한다.
 * 0이나 100에 가까울수록 낮아지고, 중간 표면은 높은 점수를 받는다.
 */
export function calcStructureBalance(surfaceStructure: number): number {
  const normalized = Math.max(0, Math.min(100, surfaceStructure)) / 100
  const distanceFromCenter = Math.abs(normalized - 0.5) / 0.5
  return Math.max(0, Math.min(100, (0.72 + 0.28 * (1 - distanceFromCenter)) * 100))
}

export function calcInputCoherence(inputs: SimulationInputs): number {
  const regression = predictFromSurfaceStructureIndex(inputs.surfaceStructureIndex)
  const structure = Math.max(0, Math.min(100, inputs.surfaceStructure))
  const structureErasability = calcErasability(structure / 100) * 100
  const expectedErasability = 0.55 * erasabilityFromSurfaceStructureSoft(inputs.surfaceStructureIndex) +
    0.45 * structureErasability
  const expectedFriction = clampScore(100 - Math.abs(structure - 48) * 0.7)

  const erasabilityMismatch = Math.abs(inputs.erasability - expectedErasability) / 100
  const visibilityMismatch = Math.abs(inputs.objectiveVisibility - regression.objectiveVisibility) / 100
  const frictionMismatch = Math.abs(inputs.frictionFit - expectedFriction) / 100
  const mismatch =
    0.45 * erasabilityMismatch +
    0.35 * visibilityMismatch +
    0.2 * frictionMismatch

  return Math.max(0, Math.min(100, 100 * (1 - mismatch * 1.35)))
}

/**
 * 최종 적합도 점수 (0~100)
 * 새 통합 기준: 핵심 항목을 곱한 뒤 가장 약한 항목을 추가로 감점한다.
 */
export function calcQuality(inputs: SimulationInputs): number {
  const v = Math.max(0, Math.min(100, inputs.objectiveVisibility))
  const e = Math.max(0, Math.min(100, inputs.erasability))
  const f = Math.max(0, Math.min(100, inputs.frictionFit))
  const s = Math.min(
    calcStructureBalance(inputs.surfaceStructure),
    calcInputCoherence(inputs)
  )
  const factor = (score: number, exponent: number) => {
    const normalized = Math.max(0, Math.min(100, score)) / 100
    return (0.02 + 0.98 * normalized) ** exponent
  }
  const t = (score: number) => 0.02 + 0.98 * (Math.max(0, Math.min(100, score)) / 100)
  const weakest = Math.min(t(v), t(e), t(f), t(s))

  return Math.max(0, Math.min(100,
    200 *
      factor(v, QUALITY_EXPONENTS.objectiveVisibility) *
      factor(e, QUALITY_EXPONENTS.erasability) *
      factor(f, QUALITY_EXPONENTS.frictionFit) *
      factor(s, QUALITY_EXPONENTS.structureScore) *
      weakest ** QUALITY_EXPONENTS.weakestPenalty
  ))
}

/**
 * 결과를 한국어 문장으로 해석 (친절함 장치)
 */
export function generateInterpretText(
  inputs: SimulationInputs,
  qualityScore: number
): string {
  const q = Math.round(qualityScore)
  const weakest = [
    { label: '객관적 가시성', value: inputs.objectiveVisibility },
    { label: '지움성', value: inputs.erasability },
    { label: '마찰 적정성', value: inputs.frictionFit },
    { label: '정밀비교값', value: inputs.surfaceStructure },
  ].sort((a, b) => a.value - b.value)[0]

  if (q >= 80) return `가시성과 지움성이 함께 높고 표면 구조도 극단적이지 않습니다. 현재 상태는 실사용 적합도가 높습니다. 최종 적합도 ${q}점.`
  if (q >= 65) return `전반적으로 양호하지만 ${weakest.label} 점수가 가장 낮아 최종 적합도를 제한하고 있습니다. 이 항목을 보완하면 점수가 가장 효율적으로 올라갑니다. 최종 적합도 ${q}점.`
  if (q >= 50) return `${weakest.label} 항목이 약점입니다. 새 공식은 지움성을 크게 보면서도 좋은 균형 조건에는 점수를 더 후하게 줍니다. 최종 적합도 ${q}점.`
  return `현재는 ${weakest.label} 점수가 낮아 실사용 균형이 부족합니다. 가시성, 지움성, 마찰 적정성, 정밀비교값을 함께 끌어올려야 합니다. 최종 적합도 ${q}점.`
}

function clampScore(v: number): number {
  return Math.max(0, Math.min(100, v))
}

// ─── 메인 시뮬레이션 함수 ───────────────────────────────────────────────────

/**
 * 전체 시뮬레이션 실행
 * @param inputs 가시성·지움성·마찰 적정성·표면 구조 점수 (0~100)
 */
export function runSimulation(inputs: SimulationInputs): SimulationResult {
  const regression = predictFromSurfaceStructureIndex(inputs.surfaceStructureIndex)
  const safeInputs: SimulationInputs = {
    surfaceStructureIndex: clampRange(
      inputs.surfaceStructureIndex,
      SURFACE_STRUCTURE_RANGE.min,
      SURFACE_STRUCTURE_RANGE.max
    ),
    visibility: clampRange(inputs.visibility, 0, 10),
    objectiveVisibility: clampScore(inputs.objectiveVisibility),
    erasability: clampScore(inputs.erasability),
    frictionFit: clampScore(inputs.frictionFit),
    surfaceStructure: clampScore(surfaceIndexToStructureScore(inputs.surfaceStructureIndex)),
  }

  // 표면 구조 점수를 교실 장면의 난반사 정도로 사용한다.
  const r = safeInputs.surfaceStructure / 100

  // 2. 반사 특성 계산
  const { D, S } = calcReflectance(r)

  // 3. 빛 확산폭 계산
  const psi = calcSpread(r)

  // 4. 기본 대비 정규화 (가시성 점수 → 0~1)
  const baseContrast = safeInputs.objectiveVisibility / 100

  // 5. 사용자 입력 기준 정규화
  const frictionFit = safeInputs.frictionFit / 100
  const surfaceStructure = safeInputs.surfaceStructure / 100
  const simulatedErasabilityScore = calcErasability(surfaceStructure) * 100
  const weightedErasabilityScore = calcWeightedErasabilityScore(
    safeInputs.erasability,
    safeInputs.surfaceStructure
  )
  const effectiveInputs: SimulationInputs = {
    ...safeInputs,
    erasability: weightedErasabilityScore,
  }

  // 6. 좌석별 계산
  const seats: SeatResult[] = SEATS_CONFIG.map(seat => {
    const glare = calcSeatGlare(S, seat.deltaTheta, psi)
    const visibility = calcSeatVisibility(
      baseContrast,
      D,
      glare,
      r,
      seat.measuredScore,
      frictionFit
    )
    return {
      id: seat.id,
      name: seat.name,
      deltaTheta: seat.deltaTheta,
      glare,
      visibility: Math.max(0, Math.min(1, visibility)),
      visibilityScore: Math.round(Math.max(0, Math.min(1, visibility)) * 100) / 10,
      surveyPercent: seat.surveyPercent,
      measuredScore: seat.measuredScore,
      svgX: seat.svgX,
      svgY: seat.svgY,
    }
  })

  // 7. 평균 가시성
  const avgVisibility = seats.reduce((s, seat) => s + seat.visibility, 0) / seats.length

  // 8. 종합 품질
  const qualityScore = calcQuality(effectiveInputs)

  // 9. 지움성 경고 (r > 0.62 → 지움성 < ~38%)
  const erasabilityWarning = weightedErasabilityScore < 45

  // 10. 해석 문장
  const interpretText = generateInterpretText(effectiveInputs, qualityScore)

  return {
    inputs: effectiveInputs,
    rawInputs: safeInputs,
    r,
    D,
    S,
    psi,
    erasability: weightedErasabilityScore / 100,
    simulatedErasabilityScore,
    weightedErasabilityScore,
    frictionFit,
    surfaceStructure,
    seats,
    avgVisibility,
    qualityScore,
    erasabilityWarning,
    interpretText,
    regression,
  }
}

// ─── 최적화 탐색 ─────────────────────────────────────────────────────────────

/**
 * 연결 모델 위에서 가장 균형 잡힌 기준을 탐색한다.
 * 임의로 모든 값을 높이지 않고, 표면 구조-가시성-지움성의 관계를 유지한 후보만 비교한다.
 */
export function findOptimalInputs(): OptimalResult {
  let best: OptimalResult | null = null

  for (let i = 0; i <= 160; i += 1) {
    const t = i / 160
    const surfaceStructureIndex = SURFACE_STRUCTURE_RANGE.min +
      (SURFACE_STRUCTURE_RANGE.max - SURFACE_STRUCTURE_RANGE.min) * t
    const regression = predictFromSurfaceStructureIndex(surfaceStructureIndex)
    const surfaceStructure = surfaceIndexToStructureScore(surfaceStructureIndex)
    const frictionFit = clampScore(100 - Math.abs(surfaceStructure - 48) * 0.7)
    const erasability = erasabilityFromSurfaceStructureSoft(surfaceStructureIndex)
    const candidateInputs: SimulationInputs = {
      surfaceStructureIndex,
      visibility: regression.subjectiveVisibility,
      objectiveVisibility: regression.objectiveVisibility,
      erasability,
      frictionFit,
      surfaceStructure,
    }
    const candidate = runSimulation(candidateInputs)
    const candidateResult = {
      ...candidate,
      optimalInputs: candidateInputs,
      optimalQuality: candidate.qualityScore,
    }

    if (!best || candidateResult.qualityScore > best.qualityScore) {
      best = candidateResult
    }
  }

  return best ?? {
    ...runSimulation(inputsFromSurfaceStructureIndex(1)),
    optimalInputs: inputsFromSurfaceStructureIndex(1),
    optimalQuality: runSimulation(inputsFromSurfaceStructureIndex(1)).qualityScore,
  }
}

// ─── 트레이드오프 곡선 데이터 ────────────────────────────────────────────────

/**
 * 트레이드오프 곡선 데이터 생성
 * X: 마찰계수 0.05~1.00 / Y: 종합 품질 0~100
 * 시각화에서 SVG 경로로 그려진다
 */
export function generateTradeoffCurve(
  inputs: SimulationInputs,
  steps = 120
): CurvePoint[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const surfaceStructure = (i / steps) * 100
    const x = SURFACE_STRUCTURE_RANGE.min +
      (SURFACE_STRUCTURE_RANGE.max - SURFACE_STRUCTURE_RANGE.min) * (surfaceStructure / 100)
    const regressionInputs = inputsFromSurfaceStructureIndex(x)
    const result = runSimulation({
      ...regressionInputs,
      erasability: inputs.erasability,
    })
    return {
      mu: 0.05 + (surfaceStructure / 100) * 0.95,
      quality:     Math.round(result.qualityScore * 10) / 10,
      erasability: Math.round(result.erasability * 1000) / 10,
      avgVis:      Math.round(result.avgVisibility * 1000) / 10,
    }
  })
}

// ─── 색 보간 헬퍼 ────────────────────────────────────────────────────────────

/**
 * 가시성 점수(0~1)를 앰버→아쿠아 색상으로 변환
 * 낮으면 amber(문제), 높으면 aqua(좋음)
 */
export function visibilityToColor(v: number): string {
  // amber: rgb(255, 138, 61) / aqua: rgb(79, 216, 200)
  const r = Math.round(255 + (79  - 255) * v)
  const g = Math.round(138 + (216 - 138) * v)
  const b = Math.round(61  + (200 - 61 ) * v)
  return `rgb(${r},${g},${b})`
}
