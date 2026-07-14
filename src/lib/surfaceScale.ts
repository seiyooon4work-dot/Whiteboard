// 표면 시뮬레이션의 표시 척도.
// 현재 모델은 1 모델 단위를 1 mm로 환산해 보여준다.
export const SURFACE_PHYSICAL_SCALE = {
  unit: 'mm',
  millimetersPerModelUnit: 1,
  planeSideInModelUnits: 2,
  horizontalSceneScale: 3,
  verticalSceneScale: 4.8,
} as const

export const surfaceModelToMillimeters = (value: number): number =>
  value * SURFACE_PHYSICAL_SCALE.millimetersPerModelUnit

export const surfaceVerticalExaggeration =
  SURFACE_PHYSICAL_SCALE.verticalSceneScale / SURFACE_PHYSICAL_SCALE.horizontalSceneScale

export function formatSurfaceMillimeters(value: number, digits = 1): string {
  if (value === 0) return `0.${'0'.repeat(digits)} ${SURFACE_PHYSICAL_SCALE.unit}`

  const sign = value > 0 ? '+' : '−'
  return `${sign}${Math.abs(value).toFixed(digits)} ${SURFACE_PHYSICAL_SCALE.unit}`
}
