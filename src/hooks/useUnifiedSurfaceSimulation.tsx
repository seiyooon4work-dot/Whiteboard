import {
  createContext,
  useCallback,
  useContext,
  useDeferredValue,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { generateTradeoffCurve, inputsFromSurfaceStructureIndex, type CurvePoint, type OptimalResult, type RegressionMaterial, type SimulationInputs, type SimulationResult as LabSimulationResult } from '../lib/simulation'
import { generateSurface } from '../lib/surface'
import { calculateCrossSectionSamples, calculateReflectionSamples } from '../lib/physics'
import { calculateMetrics } from '../lib/metrics'
import { findSimulatedOptimumAsync } from '../lib/optimizer'
import { surfaceParamsFromCalibrationSample } from '../lib/calibration'
import {
  DEFAULT_SURFACE_PARAMS,
  calculateUnifiedQuality,
  defaultInputs,
  findNearestRegressionMaterial,
  inputsFromMaterial,
  inputsFromSurfaceParams,
  materialScoringParams,
  materialFromCalibrationName,
  surfaceParamsFromInputs,
  withUnifiedQuality,
  xFromErasabilitySoft,
  xFromRegressionMetric,
  type UnifiedSurfaceState,
} from '../lib/unifiedSurface'
import type { CalibrationSample, OptimizationResult, SimulationResult as ReflectionSimulationResult, SurfaceParams } from '../types/simulation'

type UnifiedOptimizationResult = OptimizationResult & {
  unifiedQualityScore: number
  optimalInputs: SimulationInputs
  nearestRegressionMaterial: RegressionMaterial
}

type UnifiedSurfaceContextValue = {
  inputs: SimulationInputs
  setInput: (key: keyof SimulationInputs, value: number) => void
  setSurfaceStructureIndex: (value: number) => void
  surfaceParams: SurfaceParams
  setSurfaceParam: (key: keyof SurfaceParams, value: number) => void
  reflectionResult: ReflectionSimulationResult
  scoringMetrics: ReflectionSimulationResult['metrics']
  result: LabSimulationResult
  optimalResult: OptimalResult | null
  unifiedOptimum: UnifiedOptimizationResult | null
  curveData: CurvePoint[]
  selectedMaterial: RegressionMaterial
  isOptimizing: boolean
  unifiedState: UnifiedSurfaceState
  selectMaterial: (material: RegressionMaterial) => void
  applyCalibrationSample: (sample: CalibrationSample) => void
  runOptimize: () => void
  resetOptimize: () => void
}

const UnifiedSurfaceContext = createContext<UnifiedSurfaceContextValue | null>(null)

function runReflectionSimulation(params: SurfaceParams): ReflectionSimulationResult {
  const surface = generateSurface(params)
  const samples = calculateReflectionSamples(surface, params)
  const crossSectionSamples = calculateCrossSectionSamples(surface, params)
  const metrics = calculateMetrics(samples, params.incidentAngle, params.specularWindow)
  return { surface, samples, crossSectionSamples, metrics }
}

function toOptimalResult(
  labResult: LabSimulationResult,
  optimalInputs: SimulationInputs
): OptimalResult {
  return {
    ...labResult,
    optimalInputs,
    optimalQuality: labResult.qualityScore,
  }
}

export function UnifiedSurfaceProvider({ children }: { children: ReactNode }) {
  const [inputs, setInputs] = useState<SimulationInputs>(() => defaultInputs())
  const [surfaceParams, setSurfaceParams] = useState<SurfaceParams>(() =>
    surfaceParamsFromInputs(defaultInputs(), DEFAULT_SURFACE_PARAMS)
  )
  const [selectedMaterial, setSelectedMaterial] = useState<RegressionMaterial>(() =>
    findNearestRegressionMaterial(surfaceParamsFromInputs(defaultInputs(), DEFAULT_SURFACE_PARAMS))
  )
  const [unifiedOptimum, setUnifiedOptimum] = useState<UnifiedOptimizationResult | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)

  const deferredParams = useDeferredValue(surfaceParams)
  const reflectionResult = useMemo(
    () => runReflectionSimulation(deferredParams),
    [deferredParams]
  )
  const scoringReflectionResult = useMemo(
    () => runReflectionSimulation(materialScoringParams(deferredParams)),
    [deferredParams]
  )
  const result = useMemo(
    () => withUnifiedQuality(inputs, scoringReflectionResult.metrics),
    [inputs, scoringReflectionResult.metrics]
  )
  const curveData = useMemo(
    () => generateTradeoffCurve(inputs),
    [inputs]
  )

  const commitInputs = useCallback((nextInputs: SimulationInputs) => {
    const nextParams = surfaceParamsFromInputs(nextInputs, surfaceParams)
    setInputs(nextInputs)
    setSurfaceParams(nextParams)
    setSelectedMaterial(findNearestRegressionMaterial(nextParams))
    setUnifiedOptimum(null)
  }, [surfaceParams])

  const setSurfaceStructureIndex = useCallback((value: number) => {
    commitInputs(inputsFromSurfaceStructureIndex(value))
  }, [commitInputs])

  const setInput = useCallback((key: keyof SimulationInputs, value: number) => {
    if (key === 'surfaceStructureIndex') {
      setSurfaceStructureIndex(value)
      return
    }

    if (key === 'visibility' || key === 'objectiveVisibility') {
      const inferredX = xFromRegressionMetric(key, value)
      if (inferredX !== null) {
        commitInputs(inputsFromSurfaceStructureIndex(inferredX))
      }
      return
    }

    if (key === 'erasability') {
      const inferredX = xFromErasabilitySoft(value)
      commitInputs({
        ...inputsFromSurfaceStructureIndex(inferredX),
        erasability: Math.max(0, Math.min(100, value)),
      })
      return
    }

    commitInputs({
      ...inputs,
      [key]: Math.max(0, Math.min(100, value)),
    })
  }, [commitInputs, inputs, setSurfaceStructureIndex])

  const selectMaterial = useCallback((material: RegressionMaterial) => {
    const nextInputs = inputsFromMaterial(material)
    const nextParams = surfaceParamsFromInputs(nextInputs, surfaceParams)
    setSelectedMaterial(material)
    setInputs(nextInputs)
    setSurfaceParams(nextParams)
    setUnifiedOptimum(null)
  }, [surfaceParams])

  const setSurfaceParam = useCallback((key: keyof SurfaceParams, value: number) => {
    const nextParams = { ...surfaceParams, [key]: value }

    if (
      key === 'roughness' ||
      key === 'grooveDepth' ||
      key === 'anisotropy' ||
      key === 'randomness' ||
      key === 'grooveFrequency' ||
      key === 'macroCurvature'
    ) {
      setInputs(inputsFromSurfaceParams(nextParams))
      setSelectedMaterial(findNearestRegressionMaterial(nextParams))
    }

    setSurfaceParams(nextParams)
    setUnifiedOptimum(null)
  }, [surfaceParams])

  const applyCalibrationSample = useCallback((sample: CalibrationSample) => {
    const nextParams = surfaceParamsFromCalibrationSample(sample, surfaceParams)
    setSurfaceParams(nextParams)
    setInputs(inputsFromSurfaceParams(nextParams))
    setSelectedMaterial(materialFromCalibrationName(sample.materialName))
    setUnifiedOptimum(null)
  }, [surfaceParams])

  const runOptimize = useCallback(() => {
    setIsOptimizing(true)
    void findSimulatedOptimumAsync(surfaceParams)
      .then((optimum) => {
        const optimalInputs = inputsFromSurfaceParams(optimum.params)
        const labResult = withUnifiedQuality(optimalInputs, optimum.metrics)
        const unifiedQualityScore = calculateUnifiedQuality(labResult.inputs, optimum.metrics, labResult)
        const nearestRegressionMaterial = findNearestRegressionMaterial(optimum.params)
        const nextOptimum: UnifiedOptimizationResult = {
          ...optimum,
          score: unifiedQualityScore / 100,
          unifiedQualityScore,
          optimalInputs,
          nearestRegressionMaterial,
        }

        setUnifiedOptimum(nextOptimum)
        setInputs(optimalInputs)
        setSurfaceParams(optimum.params)
        setSelectedMaterial(nearestRegressionMaterial)
      })
      .finally(() => setIsOptimizing(false))
  }, [surfaceParams])

  const optimalResult = useMemo(
    () => unifiedOptimum ? toOptimalResult(result, unifiedOptimum.optimalInputs) : null,
    [result, unifiedOptimum]
  )

  const unifiedState = useMemo<UnifiedSurfaceState>(
    () => ({
      surfaceStructureIndex: result.inputs.surfaceStructureIndex,
      subjectiveVisibility: result.inputs.visibility,
      objectiveVisibility: result.inputs.objectiveVisibility,
      erasability: result.inputs.erasability,
      frictionFit: result.inputs.frictionFit,
      surfaceParams,
      reflectionMetrics: scoringReflectionResult.metrics,
      nearestMaterial: selectedMaterial.name,
      qualityScore: result.qualityScore,
    }),
    [scoringReflectionResult.metrics, result.inputs, result.qualityScore, selectedMaterial.name, surfaceParams]
  )

  const resetOptimize = useCallback(() => setUnifiedOptimum(null), [])

  return (
    <UnifiedSurfaceContext.Provider
      value={{
        inputs,
        setInput,
        setSurfaceStructureIndex,
        surfaceParams,
        setSurfaceParam,
        reflectionResult,
        scoringMetrics: scoringReflectionResult.metrics,
        result,
        optimalResult,
        unifiedOptimum,
        curveData,
        selectedMaterial,
        isOptimizing,
        unifiedState,
        selectMaterial,
        applyCalibrationSample,
        runOptimize,
        resetOptimize,
      }}
    >
      {children}
    </UnifiedSurfaceContext.Provider>
  )
}

export function useUnifiedSurfaceSimulation(): UnifiedSurfaceContextValue {
  const context = useContext(UnifiedSurfaceContext)
  if (!context) {
    throw new Error('useUnifiedSurfaceSimulation must be used inside UnifiedSurfaceProvider')
  }
  return context
}
