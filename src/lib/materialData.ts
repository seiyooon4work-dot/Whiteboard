import type { CalibrationSample } from '../types/simulation'
import type { RegressionMaterial } from './simulation'

export type MeasuredMaterial = {
  id: string
  name: string
  calibrationName: string
  surfaceStructureIndex: number
  subjectiveVisibility: number
  objectiveVisibility: number
  erasability: number
  roughnessIndex: number
  grooveIndex: number
  anisotropyIndex: number
  measuredSpecularRatio: number
  measuredDiffuseRatio: number
}

export const MEASURED_MATERIALS: MeasuredMaterial[] = [
  {
    id: 'woodrac',
    name: '우드락',
    calibrationName: '우드락',
    surfaceStructureIndex: 6.15,
    subjectiveVisibility: 7.03,
    objectiveVisibility: 80.6,
    erasability: 1.04,
    roughnessIndex: 1,
    grooveIndex: 1,
    anisotropyIndex: 0,
    measuredSpecularRatio: 0.194,
    measuredDiffuseRatio: 0.806,
  },
  {
    id: 'regular-wb',
    name: '일반 화이트보드',
    calibrationName: '일반 화이트',
    surfaceStructureIndex: 1,
    subjectiveVisibility: 6.43,
    objectiveVisibility: 66.58,
    erasability: 27.17,
    roughnessIndex: 0.352,
    grooveIndex: 0.352,
    anisotropyIndex: 0,
    measuredSpecularRatio: 0.334,
    measuredDiffuseRatio: 0.666,
  },
  {
    id: 'anti-finger',
    name: '지문방지 필름',
    calibrationName: '지문방지 필름',
    surfaceStructureIndex: 0.04,
    subjectiveVisibility: 5.41,
    objectiveVisibility: 46.88,
    erasability: 87.98,
    roughnessIndex: 0.02,
    grooveIndex: 0.02,
    anisotropyIndex: 0,
    measuredSpecularRatio: 0.531,
    measuredDiffuseRatio: 0.469,
  },
  {
    id: 'acrylic',
    name: '아크릴판',
    calibrationName: '아크릴판',
    surfaceStructureIndex: 0.03,
    subjectiveVisibility: 4.54,
    objectiveVisibility: 30,
    erasability: 59.58,
    roughnessIndex: 0.015,
    grooveIndex: 0.015,
    anisotropyIndex: 0,
    measuredSpecularRatio: 0.7,
    measuredDiffuseRatio: 0.3,
  },
  {
    id: 'paper-film',
    name: '종이질감 필름',
    calibrationName: '종이질감 필름',
    surfaceStructureIndex: 2.41,
    subjectiveVisibility: 5.54,
    objectiveVisibility: 76.61,
    erasability: 69.94,
    roughnessIndex: 0.624,
    grooveIndex: 0.624,
    anisotropyIndex: 0,
    measuredSpecularRatio: 0.234,
    measuredDiffuseRatio: 0.766,
  },
]

export function measuredToRegressionMaterial(material: MeasuredMaterial): RegressionMaterial {
  return {
    id: material.id,
    name: material.name,
    surfaceStructureIndex: material.surfaceStructureIndex,
    subjectiveVisibility: material.subjectiveVisibility,
    objectiveVisibility: material.objectiveVisibility,
    erasability: material.erasability,
  }
}

export function measuredToCalibrationSample(material: MeasuredMaterial): CalibrationSample {
  return {
    materialName: material.calibrationName,
    roughnessIndex: material.roughnessIndex,
    grooveIndex: material.grooveIndex,
    anisotropyIndex: material.anisotropyIndex,
    measuredSpecularRatio: material.measuredSpecularRatio,
    measuredDiffuseRatio: material.measuredDiffuseRatio,
    measuredErasability: material.erasability / 100,
    measuredVisibility: material.subjectiveVisibility / 10,
  }
}

export function findMeasuredMaterialByName(name: string): MeasuredMaterial | undefined {
  return MEASURED_MATERIALS.find((material) =>
    material.name === name || material.calibrationName === name
  )
}
