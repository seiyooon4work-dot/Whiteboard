import type { CalibrationSample, SurfaceParams } from '../types/simulation'
import { MEASURED_MATERIALS, measuredToCalibrationSample } from './materialData'

export type EmpiricalCalibrationEstimate = {
  erase: number
  visible: number
  specular: number
  diffuse: number
  fit: number
  nearestMaterial: string
  useScore: number
}

export const CALIBRATION_SAMPLES: CalibrationSample[] =
  MEASURED_MATERIALS.map(measuredToCalibrationSample)

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

function distanceToSample(params: SurfaceParams, sample: CalibrationSample): number {
  const roughness = params.roughness - sample.roughnessIndex
  const groove = params.grooveDepth - sample.grooveIndex
  const anisotropy = params.anisotropy - sample.anisotropyIndex
  return Math.hypot(roughness, groove, anisotropy * 0.65)
}

export function surfaceParamsFromCalibrationSample(
  sample: CalibrationSample,
  current: SurfaceParams
): SurfaceParams {
  const structure = clamp01((sample.roughnessIndex + sample.grooveIndex) / 2)

  return {
    ...current,
    roughness: sample.roughnessIndex,
    grooveDepth: sample.grooveIndex,
    anisotropy: sample.anisotropyIndex,
    randomness: clamp01(0.18 + structure * 0.48),
    grooveFrequency: Math.round(4 + structure * 12),
    macroCurvature: clamp01(0.035 + structure * 0.09),
  }
}

export function estimateEmpiricalCalibration(params: SurfaceParams): EmpiricalCalibrationEstimate {
  let weightTotal = 0
  let erase = 0
  let visible = 0
  let specular = 0
  let diffuse = 0
  let nearestMaterial = CALIBRATION_SAMPLES[0].materialName
  let nearestDistance = Number.POSITIVE_INFINITY

  CALIBRATION_SAMPLES.forEach((sample) => {
    const distance = distanceToSample(params, sample)
    const weight = 1 / (0.035 + distance) ** 2
    weightTotal += weight
    erase += sample.measuredErasability * weight
    visible += sample.measuredVisibility * weight
    specular += sample.measuredSpecularRatio * weight
    diffuse += sample.measuredDiffuseRatio * weight

    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestMaterial = sample.materialName
    }
  })

  const normalizedErase = clamp01(erase / weightTotal)
  const normalizedVisible = clamp01(visible / weightTotal)
  const normalizedSpecular = clamp01(specular / weightTotal)
  const normalizedDiffuse = clamp01(diffuse / weightTotal)
  const fit = clamp01(1 - nearestDistance / 0.85)

  // calibration-ready model: measured samples calibrate practical usability before a full regression model is added.
  const useScore = clamp01(
    0.45 * normalizedErase +
      0.35 * normalizedVisible +
      0.2 * (1 - normalizedSpecular)
  )

  return {
    erase: normalizedErase,
    visible: normalizedVisible,
    specular: normalizedSpecular,
    diffuse: normalizedDiffuse,
    fit,
    nearestMaterial,
    useScore,
  }
}
