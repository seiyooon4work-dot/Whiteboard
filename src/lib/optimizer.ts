import type { OptimizationResult, SurfaceParams } from '../types/simulation'
import { calculateMetrics } from './metrics'
import { calculateReflectionSamples } from './physics'
import { generateSurface } from './surface'
import { estimateEmpiricalCalibration } from './calibration'
import { calculateUnifiedQuality, inputsFromSurfaceParams, materialScoringParams } from './unifiedSurface'
import { runSimulation } from './simulation'

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

function scoreCandidate(params: SurfaceParams): OptimizationResult {
  const scoringParams = materialScoringParams({ ...params, lightCount: 180 })
  const surface = generateSurface(scoringParams)
  const samples = calculateReflectionSamples(surface, scoringParams)
  const metrics = calculateMetrics(samples, scoringParams.incidentAngle, scoringParams.specularWindow)

  const targetSpread = 24
  const spreadTolerance = 260
  const normalizedGlare = metrics.glareRisk

  // calibration-ready model: 실험 보정 전 기본 목적 함수이며, 실제 실험값으로 각 항목의 가중치와 목표 확산폭을 조정할 수 있다.
  const antiGlareScore = 1 - normalizedGlare
  const controlledDiffuseScore = Math.exp(-((metrics.reflectionSpread - targetSpread) ** 2) / spreadTolerance)
  const erasabilityProxy = 1 - clamp01(0.6 * params.roughness + 0.4 * params.grooveDepth)
  const surfaceStabilityScore = 1 - clamp01(0.5 * params.anisotropy + 0.5 * params.macroCurvature)
  const empirical = estimateEmpiricalCalibration(params)
  const physicsScore =
    0.3 * antiGlareScore +
    0.25 * controlledDiffuseScore +
    0.25 * erasabilityProxy +
    0.2 * surfaceStabilityScore
  const labInputs = inputsFromSurfaceParams(params)
  const labResult = runSimulation(labInputs)
  const unifiedScore = calculateUnifiedQuality(labResult.inputs, metrics, labResult) / 100
  const score = unifiedScore

  return {
    params,
    metrics,
    score,
    antiGlareScore,
    controlledDiffuseScore,
    erasabilityProxy,
    surfaceStabilityScore,
    empiricalUseScore: empirical.useScore,
    calibratedErase: empirical.erase,
    calibratedVisible: empirical.visible,
    calibrationFit: empirical.fit,
    nearestMaterial: empirical.nearestMaterial,
  }
}

function makeCandidates(baseParams: SurfaceParams): SurfaceParams[] {
  const roughnessValues = [0.2, 0.36, 0.52]
  const grooveDepthValues = [0.08, 0.22, 0.36]
  const grooveFrequencyValues = [6, 10, 14]
  const randomnessValues = [0.24, 0.54]
  const anisotropyValues = [0.08, 0.3]
  const macroCurvatureValues = [0.04, 0.16]
  const candidates: SurfaceParams[] = []

  candidates.push(baseParams)

  for (const roughness of roughnessValues) {
    for (const grooveDepth of grooveDepthValues) {
      for (const grooveFrequency of grooveFrequencyValues) {
        for (const randomness of randomnessValues) {
          for (const anisotropy of anisotropyValues) {
            for (const macroCurvature of macroCurvatureValues) {
              candidates.push({
                ...baseParams,
                roughness,
                grooveDepth,
                grooveFrequency,
                randomness,
                anisotropy,
                macroCurvature,
              })
            }
          }
        }
      }
    }
  }

  return candidates
}

function chooseBest(candidates: SurfaceParams[]): OptimizationResult | null {
  let best: OptimizationResult | null = null

  candidates.forEach((params) => {
    const candidate = scoreCandidate(params)
    if (!best || candidate.score > best.score) {
      best = candidate
    }
  })

  return best
}

function waitForBrowserFrame(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve())
  })
}

export function findSimulatedOptimum(baseParams: SurfaceParams): OptimizationResult {
  const best = chooseBest(makeCandidates(baseParams))
  return best ?? scoreCandidate(baseParams)
}

export async function findSimulatedOptimumAsync(baseParams: SurfaceParams): Promise<OptimizationResult> {
  const candidates = makeCandidates(baseParams)
  let best: OptimizationResult | null = null

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = scoreCandidate(candidates[index])
    if (!best || candidate.score > best.score) {
      best = candidate
    }

    if (index % 12 === 11) {
      await waitForBrowserFrame()
    }
  }

  return best ?? scoreCandidate(baseParams)
}
