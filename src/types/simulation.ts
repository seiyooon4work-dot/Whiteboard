export type Vec3 = {
  x: number
  y: number
  z: number
}

export type SurfaceParams = {
  roughness: number
  grooveDepth: number
  grooveFrequency: number
  randomness: number
  anisotropy: number
  macroCurvature: number
  incidentAngle: number
  lightCount: number
  specularWindow: number
}

export type SurfacePoint = {
  ix: number
  iy: number
  x: number
  y: number
  z: number
}

export type SurfaceData = {
  size: number
  heights: number[][]
  points: SurfacePoint[][]
  minHeight: number
  maxHeight: number
}

export type ReflectionSample = SurfacePoint & {
  dzdx: number
  dzdy: number
  normal: Vec3
  incident: Vec3
  reflection: Vec3
  reflectionAngle: number
}

export type ReflectionBin = {
  angle: number
  count: number
  isSpecularWindow: boolean
  isPeak: boolean
}

export type ReflectionMetrics = {
  theoreticalAngle: number
  peakAngle: number
  observedMinAngle: number
  observedMaxAngle: number
  specularRatio: number
  diffuseRatio: number
  reflectionPeakIndex: number
  reflectionSpread: number
  glareRisk: number
  histogram: ReflectionBin[]
}

export type SimulationResult = {
  surface: SurfaceData
  samples: ReflectionSample[]
  crossSectionSamples: ReflectionSample[]
  metrics: ReflectionMetrics
}

export type CalibrationSample = {
  materialName: string
  roughnessIndex: number
  grooveIndex: number
  anisotropyIndex: number
  measuredSpecularRatio: number
  measuredDiffuseRatio: number
  measuredErasability: number
  measuredVisibility: number
}

export type OptimizationResult = {
  params: SurfaceParams
  metrics: ReflectionMetrics
  score: number
  antiGlareScore: number
  controlledDiffuseScore: number
  erasabilityProxy: number
  surfaceStabilityScore: number
  empiricalUseScore: number
  calibratedErase: number
  calibratedVisible: number
  calibrationFit: number
  nearestMaterial: string
}
