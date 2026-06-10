import type { SurfaceData, SurfaceParams, SurfacePoint } from '../types/simulation'

export const SURFACE_SIZE = 49

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

function hashNoise(ix: number, iy: number): number {
  const value = Math.sin(ix * 127.1 + iy * 311.7 + 17.13) * 43758.5453123
  return (value - Math.floor(value)) * 2 - 1
}

function makeSmoothedNoise(size: number, passes: number): number[][] {
  let field = Array.from({ length: size }, (_, y) =>
    Array.from({ length: size }, (_, x) => hashNoise(x, y))
  )

  for (let pass = 0; pass < passes; pass += 1) {
    field = field.map((row, y) =>
      row.map((_, x) => {
        let sum = 0
        let weight = 0
        for (let oy = -1; oy <= 1; oy += 1) {
          for (let ox = -1; ox <= 1; ox += 1) {
            const sx = Math.max(0, Math.min(size - 1, x + ox))
            const sy = Math.max(0, Math.min(size - 1, y + oy))
            const w = ox === 0 && oy === 0 ? 4 : ox === 0 || oy === 0 ? 2 : 1
            sum += field[sy][sx] * w
            weight += w
          }
        }
        return sum / weight
      })
    )
  }

  return field
}

const smoothedNoiseCache = new Map<string, number[][]>()

function getSmoothedNoise(size: number, passes: number): number[][] {
  const key = `${size}:${passes}`
  const cached = smoothedNoiseCache.get(key)
  if (cached) return cached

  const noise = makeSmoothedNoise(size, passes)
  smoothedNoiseCache.set(key, noise)
  return noise
}

export function generateSurface(params: SurfaceParams, size = SURFACE_SIZE): SurfaceData {
  const smoothNoise = getSmoothedNoise(size, 4)
  const heights: number[][] = []
  const points: SurfacePoint[][] = []
  let minHeight = Number.POSITIVE_INFINITY
  let maxHeight = Number.NEGATIVE_INFINITY

  const roughness = clamp01(params.roughness)
  const grooveDepth = clamp01(params.grooveDepth)
  const randomness = clamp01(params.randomness)
  const anisotropy = clamp01(params.anisotropy)
  const macroCurvature = clamp01(params.macroCurvature)

  for (let iy = 0; iy < size; iy += 1) {
    const row: number[] = []
    const pointRow: SurfacePoint[] = []
    const y = (iy / (size - 1)) * 2 - 1

    for (let ix = 0; ix < size; ix += 1) {
      const x = (ix / (size - 1)) * 2 - 1
      const macro =
        macroCurvature *
        0.04 *
        (Math.sin(Math.PI * 1.2 * x + 0.4) * Math.cos(Math.PI * 0.85 * y - 0.7) +
          0.55 * Math.cos(Math.PI * 0.65 * (x + y)))

      const grooveAxis = x * (1 - 0.65 * anisotropy) + y * (0.18 + 0.82 * anisotropy)
      const groove =
        grooveDepth *
        0.014 *
        Math.sin(Math.PI * params.grooveFrequency * grooveAxis + 0.35 * Math.sin(4 * y))

      const randomRoughness = smoothNoise[iy][ix] * roughness * randomness * 0.028

      const directionalRidge =
        anisotropy *
        roughness *
        0.018 *
        Math.sin(Math.PI * (2.5 + params.grooveFrequency * 0.35) * y + 0.7 * Math.sin(2 * x))

      const z = macro + groove + randomRoughness + directionalRidge
      row.push(z)
      pointRow.push({ ix, iy, x, y, z })
      minHeight = Math.min(minHeight, z)
      maxHeight = Math.max(maxHeight, z)
    }

    heights.push(row)
    points.push(pointRow)
  }

  return { size, heights, points, minHeight, maxHeight }
}
