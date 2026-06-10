import type { ReflectionSample, SurfaceData, SurfaceParams, Vec3 } from '../types/simulation'

const RAD_TO_DEG = 180 / Math.PI
const DEG_TO_RAD = Math.PI / 180

export function normalize(v: Vec3): Vec3 {
  const length = Math.hypot(v.x, v.y, v.z) || 1
  return { x: v.x / length, y: v.y / length, z: v.z / length }
}

export function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z
}

export function getIncidentVector(incidentAngle: number): Vec3 {
  const rad = incidentAngle * DEG_TO_RAD
  return normalize({
    x: -Math.sin(rad),
    y: 0,
    z: -Math.cos(rad),
  })
}

export function getTheoreticalReflectionAngle(incidentAngle: number): number {
  return -incidentAngle
}

export function reflectVector(incident: Vec3, normal: Vec3): Vec3 {
  const scale = 2 * dot(incident, normal)
  return normalize({
    x: incident.x - scale * normal.x,
    y: incident.y - scale * normal.y,
    z: incident.z - scale * normal.z,
  })
}

export function calculateNormal(surface: SurfaceData, ix: number, iy: number): {
  dzdx: number
  dzdy: number
  normal: Vec3
} {
  const left = Math.max(0, ix - 1)
  const right = Math.min(surface.size - 1, ix + 1)
  const down = Math.max(0, iy - 1)
  const up = Math.min(surface.size - 1, iy + 1)
  const cellSize = 2 / (surface.size - 1)
  const dxDistance = Math.max(1, right - left) * cellSize
  const dyDistance = Math.max(1, up - down) * cellSize

  const dzdx = (surface.heights[iy][right] - surface.heights[iy][left]) / dxDistance
  const dzdy = (surface.heights[up][ix] - surface.heights[down][ix]) / dyDistance
  const normal = normalize({ x: -dzdx, y: -dzdy, z: 1 })

  return { dzdx, dzdy, normal }
}

function makeSampleIndices(size: number, lightCount: number): Array<[number, number]> {
  const inner = size - 2
  const total = inner * inner
  const count = Math.max(20, Math.min(lightCount, total))
  const indices: Array<[number, number]> = []
  const columns = Math.ceil(Math.sqrt(count))
  const rows = Math.ceil(count / columns)

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      if (indices.length >= count) break

      const xT = columns === 1 ? 0.5 : (column + 0.5) / columns
      const yT = rows === 1 ? 0.5 : (row + 0.5) / rows
      const stagger = row % 2 === 0 ? 0 : 0.5 / columns
      const ix = 1 + Math.min(inner - 1, Math.max(0, Math.round(((xT + stagger) % 1) * (inner - 1))))
      const iy = 1 + Math.min(inner - 1, Math.max(0, Math.round(yT * (inner - 1))))
      indices.push([ix, iy])
    }
  }

  return indices
}

export function calculateReflectionSamples(
  surface: SurfaceData,
  params: SurfaceParams
): ReflectionSample[] {
  const incident = getIncidentVector(params.incidentAngle)
  const indices = makeSampleIndices(surface.size, params.lightCount)

  return indices.map(([ix, iy]) => {
    const point = surface.points[iy][ix]
    const { dzdx, dzdy, normal } = calculateNormal(surface, ix, iy)
    const reflection = reflectVector(incident, normal)
    const reflectionAngle = Math.atan2(reflection.x, reflection.z) * RAD_TO_DEG

    return {
      ...point,
      dzdx,
      dzdy,
      normal,
      incident,
      reflection,
      reflectionAngle,
    }
  })
}

export function calculateCrossSectionSamples(
  surface: SurfaceData,
  params: SurfaceParams,
  count = 11
): ReflectionSample[] {
  const incident = getIncidentVector(params.incidentAngle)
  const iy = Math.floor(surface.size / 2)
  const samples: ReflectionSample[] = []
  const candidateCount = surface.size - 6
  const bands = Math.min(count, candidateCount)

  for (let band = 0; band < bands; band += 1) {
    const start = 3 + Math.floor((band / bands) * candidateCount)
    const end = 3 + Math.floor(((band + 1) / bands) * candidateCount)
    let bestIx = start
    let bestScore = Number.POSITIVE_INFINITY

    for (let ix = start; ix < Math.max(start + 1, end); ix += 1) {
      const previousSlope = surface.heights[iy][ix] - surface.heights[iy][ix - 1]
      const nextSlope = surface.heights[iy][ix + 1] - surface.heights[iy][ix]
      const curvature = Math.abs(surface.heights[iy][ix + 1] - 2 * surface.heights[iy][ix] + surface.heights[iy][ix - 1])
      const turningPointPenalty = previousSlope * nextSlope <= 0 ? 1 : 0
      const slopePenalty = Math.abs(previousSlope + nextSlope) * 0.25
      const score = curvature * 8 + turningPointPenalty * 0.12 + slopePenalty

      if (score < bestScore) {
        bestScore = score
        bestIx = ix
      }
    }

    const ix = Math.min(surface.size - 4, Math.max(3, bestIx))
    const point = surface.points[iy][ix]
    const { dzdx } = calculateNormal(surface, ix, iy)
    const normal = normalize({ x: -dzdx, y: 0, z: 1 })
    const reflection = reflectVector(incident, normal)

    samples.push({
      ...point,
      dzdx,
      dzdy: 0,
      normal,
      incident,
      reflection,
      reflectionAngle: Math.atan2(reflection.x, reflection.z) * RAD_TO_DEG,
    })
  }

  return samples
}
