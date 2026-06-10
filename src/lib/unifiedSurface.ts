import type { ReflectionMetrics, SurfaceParams } from '../types/simulation'
import {
  calcInputCoherence,
  clampRange,
  erasabilityFromSurfaceStructureSoft,
  generateInterpretText,
  inputsFromSurfaceStructureIndex,
  predictFromSurfaceStructureIndex,
  REGRESSION_MATERIALS,
  runSimulation,
  SURFACE_STRUCTURE_RANGE,
  surfaceIndexToStructureScore,
  type RegressionMaterial,
  type SimulationInputs,
  type SimulationResult,
} from './simulation'
import { MEASURED_MATERIALS, findMeasuredMaterialByName, measuredToRegressionMaterial } from './materialData'

export type UnifiedSurfaceState = {
  surfaceStructureIndex: number
  subjectiveVisibility: number
  objectiveVisibility: number
  erasability: number
  frictionFit: number
  surfaceParams: SurfaceParams
  reflectionMetrics: ReflectionMetrics
  nearestMaterial: string
  qualityScore: number
}

export const DEFAULT_SURFACE_PARAMS: SurfaceParams = {
  roughness: 0.34,
  grooveDepth: 0.22,
  grooveFrequency: 8,
  randomness: 0.38,
  anisotropy: 0.18,
  macroCurvature: 0.1,
  incidentAngle: -45,
  lightCount: 150,
  specularWindow: 8,
}

export const MATERIAL_SCORE_INCIDENT_ANGLE = -45

export function materialScoringParams(params: SurfaceParams): SurfaceParams {
  return {
    ...params,
    incidentAngle: MATERIAL_SCORE_INCIDENT_ANGLE,
  }
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

function weightedMeasuredBySurfaceIndex(x: number) {
  let total = 0
  const acc = {
    roughness: 0,
    groove: 0,
    anisotropy: 0,
    subjective: 0,
    objective: 0,
    erasability: 0,
  }

  MEASURED_MATERIALS.forEach((material) => {
    const distance = Math.abs(material.surfaceStructureIndex - x)
    const weight = 1 / (0.08 + distance) ** 2
    total += weight
    acc.roughness += material.roughnessIndex * weight
    acc.groove += material.grooveIndex * weight
    acc.anisotropy += material.anisotropyIndex * weight
    acc.subjective += material.subjectiveVisibility * weight
    acc.objective += material.objectiveVisibility * weight
    acc.erasability += material.erasability * weight
  })

  return {
    roughness: acc.roughness / total,
    groove: acc.groove / total,
    anisotropy: acc.anisotropy / total,
    subjective: acc.subjective / total,
    objective: acc.objective / total,
    erasability: acc.erasability / total,
  }
}

function weightedMeasuredByParams(params: SurfaceParams) {
  let total = 0
  const acc = {
    x: 0,
    subjective: 0,
    objective: 0,
    erasability: 0,
  }
  let nearest = MEASURED_MATERIALS[0]
  let nearestDistance = Number.POSITIVE_INFINITY

  MEASURED_MATERIALS.forEach((material) => {
    const distance = Math.hypot(
      params.roughness - material.roughnessIndex,
      params.grooveDepth - material.grooveIndex,
      (params.anisotropy - material.anisotropyIndex) * 0.65
    )
    const weight = 1 / (0.035 + distance) ** 2
    total += weight
    acc.x += material.surfaceStructureIndex * weight
    acc.subjective += material.subjectiveVisibility * weight
    acc.objective += material.objectiveVisibility * weight
    acc.erasability += material.erasability * weight

    if (distance < nearestDistance) {
      nearestDistance = distance
      nearest = material
    }
  })

  return {
    surfaceStructureIndex: acc.x / total,
    subjectiveVisibility: acc.subjective / total,
    objectiveVisibility: acc.objective / total,
    erasability: acc.erasability / total,
    nearestMaterial: measuredToRegressionMaterial(nearest),
  }
}

export function findNearestRegressionMaterial(params: SurfaceParams): RegressionMaterial {
  return weightedMeasuredByParams(params).nearestMaterial
}

export function inputsFromMaterial(material: RegressionMaterial): SimulationInputs {
  return {
    surfaceStructureIndex: material.surfaceStructureIndex,
    visibility: material.subjectiveVisibility,
    objectiveVisibility: material.objectiveVisibility,
    erasability: material.erasability,
    frictionFit: clampRange(
      100 - Math.abs(surfaceIndexToStructureScore(material.surfaceStructureIndex) - 48) * 0.7,
      0,
      100
    ),
    surfaceStructure: surfaceIndexToStructureScore(material.surfaceStructureIndex),
  }
}

export function surfaceParamsFromInputs(
  inputs: SimulationInputs,
  current: SurfaceParams = DEFAULT_SURFACE_PARAMS
): SurfaceParams {
  const measured = weightedMeasuredBySurfaceIndex(inputs.surfaceStructureIndex)
  const structure = clamp01(surfaceIndexToStructureScore(inputs.surfaceStructureIndex) / 100)
  const erasePull = clamp01(1 - inputs.erasability / 100)
  const visibilityPull = clamp01(inputs.objectiveVisibility / 100)
  const roughness = clamp01(0.68 * measured.roughness + 0.2 * structure + 0.12 * erasePull)
  const grooveDepth = clamp01(0.7 * measured.groove + 0.18 * structure + 0.12 * erasePull)

  return {
    ...current,
    roughness,
    grooveDepth,
    anisotropy: clamp01(0.75 * measured.anisotropy + 0.25 * Math.abs(visibilityPull - 0.62)),
    randomness: clamp01(0.16 + structure * 0.42 + erasePull * 0.12),
    grooveFrequency: Math.round(clampRange(4 + structure * 12 + measured.groove * 3, 1, 20)),
    macroCurvature: clamp01(0.035 + structure * 0.1),
  }
}

export function inputsFromSurfaceParams(params: SurfaceParams): SimulationInputs {
  const measured = weightedMeasuredByParams(params)
  const roughGroove = clamp01((params.roughness + params.grooveDepth) / 2)
  const detail = clamp01(
    0.68 * roughGroove +
      0.14 * params.randomness +
      0.1 * params.macroCurvature +
      0.08 * (params.grooveFrequency - 1) / 19
  )
  const detailX = SURFACE_STRUCTURE_RANGE.min +
    detail * (SURFACE_STRUCTURE_RANGE.max - SURFACE_STRUCTURE_RANGE.min)
  const surfaceStructureIndex = clampRange(
    0.72 * measured.surfaceStructureIndex + 0.28 * detailX,
    SURFACE_STRUCTURE_RANGE.min,
    SURFACE_STRUCTURE_RANGE.max
  )
  const regression = predictFromSurfaceStructureIndex(surfaceStructureIndex)
  const structure = surfaceIndexToStructureScore(surfaceStructureIndex)
  const structureErasability = erasabilityFromSurfaceStructureSoft(surfaceStructureIndex)

  return {
    surfaceStructureIndex,
    visibility: clampRange(0.65 * regression.subjectiveVisibility + 0.35 * measured.subjectiveVisibility, 0, 10),
    objectiveVisibility: clampRange(0.65 * regression.objectiveVisibility + 0.35 * measured.objectiveVisibility, 0, 100),
    erasability: clampRange(
      0.5 * measured.erasability +
        0.35 * structureErasability +
        0.15 * (100 * (1 - roughGroove)),
      0,
      100
    ),
    frictionFit: clampRange(
      100 - Math.abs(structure - 48) * 0.62 - params.anisotropy * 7 - params.macroCurvature * 4,
      0,
      100
    ),
    surfaceStructure: structure,
  }
}

export function materialFromCalibrationName(name: string): RegressionMaterial {
  const measured = findMeasuredMaterialByName(name)
  return measured ? measuredToRegressionMaterial(measured) : REGRESSION_MATERIALS[0]
}

export function xFromRegressionMetric(key: keyof SimulationInputs, value: number): number | null {
  if (key === 'visibility') {
    const prediction = (x: number) => predictFromSurfaceStructureIndex(x).subjectiveVisibility
    return xFromTarget(value, 0, 10, prediction)
  }
  if (key === 'objectiveVisibility') {
    const prediction = (x: number) => predictFromSurfaceStructureIndex(x).objectiveVisibility
    return xFromTarget(value, 0, 100, prediction)
  }
  return null
}

export function xFromErasabilitySoft(value: number): number {
  return xFromTarget(value, 0, 100, erasabilityFromSurfaceStructureSoft)
}

function xFromTarget(
  value: number,
  min: number,
  max: number,
  predictor: (x: number) => number
): number {
  const target = clampRange(value, min, max)
  let bestX: number = SURFACE_STRUCTURE_RANGE.min
  let bestError = Number.POSITIVE_INFINITY

  for (let i = 0; i <= 180; i += 1) {
    const x = SURFACE_STRUCTURE_RANGE.min +
      (SURFACE_STRUCTURE_RANGE.max - SURFACE_STRUCTURE_RANGE.min) * (i / 180)
    const error = Math.abs(predictor(x) - target)
    if (error < bestError) {
      bestError = error
      bestX = x
    }
  }

  return bestX
}

export function calculateReflectionStabilityScore(metrics: ReflectionMetrics): number {
  const antiGlare = (1 - metrics.glareRisk) * 100
  const controlledDiffuse = (1 - Math.abs(metrics.diffuseRatio - 0.58) / 0.58) * 100
  const spreadFit = Math.exp(-((metrics.reflectionSpread - 22) ** 2) / 520) * 100
  const peakControl = (1 - clamp01((metrics.reflectionPeakIndex - 4) / 10)) * 100

  return clampRange(
    0.35 * antiGlare +
      0.25 * controlledDiffuse +
      0.25 * spreadFit +
      0.15 * peakControl,
    0,
    100
  )
}

function scoreFactor(score: number, exponent: number): number {
  const normalized = clampRange(score, 0, 100) / 100
  return (0.02 + 0.98 * normalized) ** exponent
}

function transformedScore(score: number): number {
  return 0.02 + 0.98 * (clampRange(score, 0, 100) / 100)
}

export function calculateUnifiedQuality(
  inputs: SimulationInputs,
  metrics: ReflectionMetrics,
  labResult: SimulationResult = runSimulation(inputs)
): number {
  const erase = labResult.weightedErasabilityScore
  const objective = clampRange(inputs.objectiveVisibility, 0, 100)
  const reflection = calculateReflectionStabilityScore(metrics)
  const coherence = calcInputCoherence(inputs)
  const structure = Math.min(reflection, coherence)
  const friction = clampRange(inputs.frictionFit, 0, 100)
  const weakest = Math.min(
    transformedScore(objective),
    transformedScore(erase),
    transformedScore(friction),
    transformedScore(structure)
  )

  return clampRange(
    200 *
      scoreFactor(objective, 0.4) *
      scoreFactor(erase, 0.3) *
      scoreFactor(friction, 0.2) *
      scoreFactor(structure, 0.1) *
      weakest ** 0.7,
    0,
    100
  )
}

export function withUnifiedQuality(
  inputs: SimulationInputs,
  metrics: ReflectionMetrics
): SimulationResult {
  const base = runSimulation(inputs)
  const qualityScore = calculateUnifiedQuality(base.inputs, metrics, base)

  return {
    ...base,
    qualityScore,
    interpretText: generateInterpretText(base.inputs, qualityScore),
  }
}

export function defaultInputs(): SimulationInputs {
  return inputsFromSurfaceStructureIndex(REGRESSION_MATERIALS[1].surfaceStructureIndex)
}
