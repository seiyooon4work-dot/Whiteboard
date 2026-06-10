import type { ReflectionBin, ReflectionMetrics, ReflectionSample } from '../types/simulation'
import { getTheoreticalReflectionAngle } from './physics'

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

function angleDistance(a: number, b: number): number {
  return Math.abs(a - b)
}

export function calculateMetrics(
  samples: ReflectionSample[],
  incidentAngle: number,
  specularWindow: number
): ReflectionMetrics {
  const theoreticalAngle = getTheoreticalReflectionAngle(incidentAngle)
  const angularSamples = samples.filter(
    (sample) =>
      sample.reflection.z > 0 &&
      sample.reflectionAngle >= -90 &&
      sample.reflectionAngle <= 90
  )
  const bins: ReflectionBin[] = Array.from({ length: 37 }, (_, index) => {
    const angle = -90 + index * 5
    return {
      angle,
      count: 0,
      isSpecularWindow: angleDistance(angle, theoreticalAngle) <= specularWindow,
      isPeak: false,
    }
  })

  angularSamples.forEach((sample) => {
    const binIndex = Math.max(0, Math.min(bins.length - 1, Math.round((sample.reflectionAngle + 90) / 5)))
    bins[binIndex].count += 1
  })

  const total = Math.max(1, angularSamples.length)
  const specularCount = angularSamples.filter(
    (sample) => angleDistance(sample.reflectionAngle, theoreticalAngle) <= specularWindow
  ).length

  const meanAngle = angularSamples.reduce((sum, sample) => sum + sample.reflectionAngle, 0) / total
  const variance =
    angularSamples.reduce((sum, sample) => sum + (sample.reflectionAngle - meanAngle) ** 2, 0) / total
  const reflectionSpread = Math.sqrt(variance)
  const observedAngles = angularSamples.map((sample) => sample.reflectionAngle)
  const observedMinAngle = observedAngles.length > 0 ? Math.min(...observedAngles) : 0
  const observedMaxAngle = observedAngles.length > 0 ? Math.max(...observedAngles) : 0

  const peak = bins.reduce((best, bin) => (bin.count > best.count ? bin : best), bins[0])
  peak.isPeak = true
  const averageBin = total / bins.length
  const reflectionPeakIndex = averageBin > 0 ? peak.count / averageBin : 0
  const specularRatio = specularCount / total
  const diffuseRatio = 1 - specularRatio
  const normalizedPeakIndex = clamp01((reflectionPeakIndex - 1) / 8)

  // 실험값으로 보정 가능한 임시 모델: glareRisk는 현재 정반사 비율과 피크 집중도를 함께 쓰는 calibration-ready estimate이다.
  const glareRisk = clamp01(0.55 * specularRatio + 0.45 * normalizedPeakIndex)

  return {
    theoreticalAngle,
    peakAngle: peak.angle,
    observedMinAngle,
    observedMaxAngle,
    specularRatio,
    diffuseRatio,
    reflectionPeakIndex,
    reflectionSpread,
    glareRisk,
    histogram: bins,
  }
}
