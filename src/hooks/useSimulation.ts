// 시뮬레이션 상태 관리 훅
// 4가지 기준 점수를 받아 계산 결과를 메모이즈해 반환한다
import { useMemo, useState } from 'react'
import {
  runSimulation,
  findOptimalInputs,
  generateTradeoffCurve,
  inputsFromSurfaceStructureIndex,
  REGRESSION_MATERIALS,
  REGRESSION_FORMULAS,
  SURFACE_STRUCTURE_RANGE,
  clampRange,
  surfaceIndexToStructureScore,
  erasabilityFromSurfaceStructureSoft,
  type SimulationInputs,
  type SimulationResult,
  type OptimalResult,
  type CurvePoint,
  type RegressionMaterial,
} from '../lib/simulation'

interface UseSimulationReturn {
  inputs: SimulationInputs
  setInput: (key: keyof SimulationInputs, value: number) => void
  setSurfaceStructureIndex: (value: number) => void
  result: SimulationResult
  optimalResult: OptimalResult | null
  curveData: CurvePoint[]
  selectedMaterial: RegressionMaterial
  isOptimizing: boolean
  selectMaterial: (material: RegressionMaterial) => void
  runOptimize: () => void
  resetOptimize: () => void
}

const DEFAULT_MATERIAL = REGRESSION_MATERIALS[1]

function xFromRegressionMetric(key: keyof SimulationInputs, value: number): number | null {
  if (key === 'visibility') {
    const { intercept, slope } = REGRESSION_FORMULAS.subjectiveVisibility
    return (clampRange(value, 0, 10) - intercept) / slope
  }
  if (key === 'objectiveVisibility') {
    const { intercept, slope } = REGRESSION_FORMULAS.objectiveVisibility
    return (clampRange(value, 0, 100) - intercept) / slope
  }
  return null
}

function xFromErasabilitySoft(value: number): number {
  const target = clampRange(value, 0, 100)
  let bestX: number = SURFACE_STRUCTURE_RANGE.min
  let bestError = Number.POSITIVE_INFINITY

  for (let i = 0; i <= 120; i += 1) {
    const x = SURFACE_STRUCTURE_RANGE.min +
      (SURFACE_STRUCTURE_RANGE.max - SURFACE_STRUCTURE_RANGE.min) * (i / 120)
    const error = Math.abs(erasabilityFromSurfaceStructureSoft(x) - target)
    if (error < bestError) {
      bestError = error
      bestX = x
    }
  }

  return bestX
}

function inputsFromMaterial(material: RegressionMaterial): SimulationInputs {
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

export function useSimulation(): UseSimulationReturn {
  const [inputs, setInputs] = useState<SimulationInputs>(() => inputsFromMaterial(DEFAULT_MATERIAL))
  const [selectedMaterial, setSelectedMaterial] = useState<RegressionMaterial>(DEFAULT_MATERIAL)
  const [optimalResult, setOptimalResult] = useState<OptimalResult | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)

  // 메인 시뮬레이션 결과
  const result = useMemo(
    () => runSimulation(inputs),
    [inputs]
  )

  // 표면 구조 점수를 훑어보는 참고 곡선
  const curveData = useMemo(
    () => generateTradeoffCurve(inputs),
    [inputs]
  )

  const setInput = (key: keyof SimulationInputs, value: number) => {
    if (key === 'surfaceStructureIndex') {
      setSurfaceStructureIndex(value)
    } else if (key === 'visibility' || key === 'objectiveVisibility') {
      const inferredX = xFromRegressionMetric(key, value)
      if (inferredX !== null) {
        setInputs(inputsFromSurfaceStructureIndex(inferredX))
      }
    } else if (key === 'erasability') {
      const nextErasability = clampRange(value, 0, 100)
      const inferredX = xFromErasabilitySoft(nextErasability)
      setInputs({
        ...inputsFromSurfaceStructureIndex(inferredX),
        erasability: nextErasability,
      })
    } else {
      setInputs(prev => ({ ...prev, [key]: clampRange(value, 0, 100) }))
    }
    setOptimalResult(null)
  }

  const setSurfaceStructureIndex = (value: number) => {
    const nextX = clampRange(value, SURFACE_STRUCTURE_RANGE.min, SURFACE_STRUCTURE_RANGE.max)
    setInputs(inputsFromSurfaceStructureIndex(nextX))
    setOptimalResult(null)
  }

  const selectMaterial = (material: RegressionMaterial) => {
    setSelectedMaterial(material)
    setInputs(inputsFromMaterial(material))
    setOptimalResult(null)
  }

  // 권장 기준 적용: 약간의 지연을 줘 "계산 중" 느낌을 연출
  const runOptimize = () => {
    setIsOptimizing(true)
    setTimeout(() => {
      const opt = findOptimalInputs()
      setOptimalResult(opt)
      setInputs(opt.optimalInputs)
      setIsOptimizing(false)
    }, 600)
  }

  const resetOptimize = () => setOptimalResult(null)

  return {
    inputs,
    setInput,
    setSurfaceStructureIndex,
    result,
    optimalResult,
    curveData,
    selectedMaterial,
    isOptimizing,
    selectMaterial,
    runOptimize,
    resetOptimize,
  }
}
