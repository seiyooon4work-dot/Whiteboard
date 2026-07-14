import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Maximize2, Minimize2 } from 'lucide-react'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { ReflectionSample, SurfaceData } from '../../types/simulation'
import {
  SURFACE_PHYSICAL_SCALE,
  surfaceModelToMillimeters,
  surfaceVerticalExaggeration,
} from '../../lib/surfaceScale'

type SurfaceSceneProps = {
  surface: SurfaceData
  samples: ReflectionSample[]
  compact?: boolean
}

function toScenePoint(x: number, y: number, z: number): [number, number, number] {
  return [
    x * SURFACE_PHYSICAL_SCALE.horizontalSceneScale,
    z * SURFACE_PHYSICAL_SCALE.verticalSceneScale,
    y * SURFACE_PHYSICAL_SCALE.horizontalSceneScale,
  ]
}

function toSceneVector(vector: { x: number; y: number; z: number }, scale: number): THREE.Vector3 {
  return new THREE.Vector3(vector.x * scale, vector.z * scale, vector.y * scale)
}

function toSceneNormal(vector: { x: number; y: number; z: number }, scale: number): THREE.Vector3 {
  return toSceneVector(vector, scale)
}

function SurfaceMesh({ surface }: { surface: SurfaceData }) {
  const geometry = useMemo(() => {
    const vertices: number[] = []
    const indices: number[] = []
    const colors: number[] = []
    const aqua = new THREE.Color('#4FD8C8')
    const violet = new THREE.Color('#8B6FE8')
    const range = Math.max(0.001, surface.maxHeight - surface.minHeight)

    for (let iy = 0; iy < surface.size; iy += 1) {
      for (let ix = 0; ix < surface.size; ix += 1) {
        const point = surface.points[iy][ix]
        vertices.push(...toScenePoint(point.x, point.y, point.z))
        const t = (point.z - surface.minHeight) / range
        const color = violet.clone().lerp(aqua, t)
        colors.push(color.r, color.g, color.b)
      }
    }

    for (let iy = 0; iy < surface.size - 1; iy += 1) {
      for (let ix = 0; ix < surface.size - 1; ix += 1) {
        const a = iy * surface.size + ix
        const b = a + 1
        const c = a + surface.size
        const d = c + 1
        indices.push(a, c, b, b, c, d)
      }
    }

    const meshGeometry = new THREE.BufferGeometry()
    meshGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    meshGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    meshGeometry.setIndex(indices)
    meshGeometry.computeVertexNormals()
    return meshGeometry
  }, [surface])

  return (
    <mesh geometry={geometry} rotation={[0, 0, 0]}>
      <meshStandardMaterial vertexColors roughness={0.6} metalness={0.08} side={THREE.DoubleSide} />
    </mesh>
  )
}

function LightRays({ samples }: { samples: ReflectionSample[] }) {
  const rayData = useMemo(() => {
    const displayTarget = 96
    const step = Math.max(1, Math.ceil(samples.length / displayTarget))
    const visibleSamples = samples
      .filter((sample) => sample.reflection.z > 0.03)
      .filter((_, index) => index % step === 0)
      .slice(0, displayTarget)

    const incidentVertices: number[] = []
    const reflectedVertices: number[] = []
    const contactVertices: number[] = []

    visibleSamples.forEach((sample) => {
      const surfacePoint = new THREE.Vector3(...toScenePoint(sample.x, sample.y, sample.z))
      const contactPoint = surfacePoint.clone().add(toSceneNormal(sample.normal, 0.035))
      const incidentStart = contactPoint.clone().sub(toSceneVector(sample.incident, 0.92))
      const reflectionEnd = contactPoint.clone().add(toSceneVector(sample.reflection, 0.82))

      incidentVertices.push(...incidentStart.toArray(), ...contactPoint.toArray())
      reflectedVertices.push(...contactPoint.toArray(), ...reflectionEnd.toArray())
      contactVertices.push(...contactPoint.toArray())
    })

    const incidentGeometry = new THREE.BufferGeometry()
    incidentGeometry.setAttribute('position', new THREE.Float32BufferAttribute(incidentVertices, 3))

    const reflectedGeometry = new THREE.BufferGeometry()
    reflectedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(reflectedVertices, 3))

    const contactGeometry = new THREE.BufferGeometry()
    contactGeometry.setAttribute('position', new THREE.Float32BufferAttribute(contactVertices, 3))

    return { incidentGeometry, reflectedGeometry, contactGeometry }
  }, [samples])

  return (
    <>
      <lineSegments geometry={rayData.incidentGeometry}>
        <lineBasicMaterial color="#FFB870" transparent opacity={0.62} />
      </lineSegments>
      <lineSegments geometry={rayData.reflectedGeometry}>
        <lineBasicMaterial color="#7FEEE2" transparent opacity={0.72} />
      </lineSegments>
      <points geometry={rayData.contactGeometry}>
        <pointsMaterial color="#F5F0E8" size={0.035} sizeAttenuation transparent opacity={0.72} depthWrite={false} />
      </points>
    </>
  )
}

export const SurfaceScene = memo(function SurfaceScene({ surface, samples, compact = false }: SurfaceSceneProps) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const heightSpan = surfaceModelToMillimeters(Math.max(0, surface.maxHeight - surface.minHeight))

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === sceneRef.current)
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !document.fullscreenElement) {
        setIsFullscreen(false)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const toggleFullscreen = async () => {
    const scene = sceneRef.current
    if (!scene) return

    if (document.fullscreenElement === scene) {
      await document.exitFullscreen?.()
      return
    }

    if (isFullscreen && !document.fullscreenElement) {
      setIsFullscreen(false)
      return
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen?.()
    }

    if (scene.requestFullscreen) {
      try {
        await scene.requestFullscreen()
        return
      } catch {
        // 일부 모바일 브라우저는 일반 요소의 네이티브 전체화면을 허용하지 않는다.
      }
    }

    setIsFullscreen(true)
  }

  return (
    <div
      ref={sceneRef}
      className={`relative ${isFullscreen ? 'fixed inset-0 z-[80] h-[100dvh] w-screen rounded-none' : compact ? 'h-[260px] sm:h-[340px] rounded-2xl' : 'h-[420px] sm:h-[560px] rounded-2xl'} overflow-hidden`}
      style={{ border: isFullscreen ? 'none' : '1px solid rgba(46,63,102,0.72)', background: '#080A12' }}
    >
      <div className="h-full w-full">
        <Canvas
          camera={{ position: [4.9, 4.5, 5.7], fov: 39 }}
          dpr={[1, 1.5]}
          frameloop="demand"
          gl={{ antialias: false, powerPreference: 'high-performance' }}
        >
          <color attach="background" args={['#080A12']} />
          <fog attach="fog" args={['#080A12', 7, 12]} />
          <ambientLight intensity={0.58} />
          <directionalLight position={[4, 5, 3]} intensity={1.4} color="#F5F0E8" />
          <directionalLight position={[-3, 2, -4]} intensity={0.7} color="#4FD8C8" />
          <gridHelper args={[7.2, 28, '#2E3F66', '#1E2840']} position={[0, -0.82, 0]} />
          <SurfaceMesh surface={surface} />
          <LightRays samples={samples} />
          <OrbitControls enableDamping dampingFactor={0.08} minDistance={3.2} maxDistance={8.8} />
        </Canvas>
      </div>

      <div className="absolute inset-x-4 top-4 z-10 flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          <span className="rounded-full px-3 py-1" style={{ background: 'rgba(255,138,61,0.12)', color: 'var(--amber-bright)' }}>
            입사광
          </span>
          <span className="rounded-full px-3 py-1" style={{ background: 'rgba(79,216,200,0.12)', color: 'var(--aqua-bright)' }}>
            반사광
          </span>
        </div>
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? '전체화면 닫기' : '3D 표면 전체화면으로 보기'}
          title={isFullscreen ? '전체화면 닫기' : '전체화면으로 보기'}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-subtitle font-bold transition-colors"
          style={{
            background: 'rgba(8,10,18,0.78)',
            border: '1px solid rgba(79,216,200,0.34)',
            color: 'var(--ivory)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {isFullscreen ? <Minimize2 size={15} aria-hidden="true" /> : <Maximize2 size={15} aria-hidden="true" />}
          <span className="hidden sm:inline">{isFullscreen ? '닫기' : '전체화면'}</span>
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 text-[11px]" style={{ color: 'rgba(245,240,232,0.64)' }}>
        드래그하여 회전 · 휠로 확대
      </div>

      <div
        className="pointer-events-none absolute bottom-3 right-3 min-w-[178px] rounded-xl px-3 py-2 text-[10px] leading-relaxed sm:bottom-4 sm:right-4"
        style={{
          background: 'rgba(8,10,18,0.78)',
          border: '1px solid rgba(245,240,232,0.16)',
          color: 'var(--ivory-dim)',
          backdropFilter: 'blur(10px)',
        }}
        aria-label={`밀리미터 척도. 평면 범위 ${SURFACE_PHYSICAL_SCALE.planeSideInModelUnits.toFixed(1)} 곱하기 ${SURFACE_PHYSICAL_SCALE.planeSideInModelUnits.toFixed(1)} 밀리미터, 높이 변화 ${heightSpan.toFixed(3)} 밀리미터, 수직 표현 배율 ${surfaceVerticalExaggeration.toFixed(1)}배`}
      >
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <span className="font-subtitle font-bold tracking-widest" style={{ color: 'var(--ivory)' }}>척도</span>
          <span className="font-mono" style={{ color: 'var(--aqua-bright)' }}>{SURFACE_PHYSICAL_SCALE.unit} 기준</span>
        </div>
        <div className="mb-1 flex items-center gap-2 font-mono" style={{ color: 'var(--ivory)' }}>
          <span className="relative inline-block h-2 w-16 shrink-0">
            <span className="absolute inset-x-0 top-1 border-t" style={{ borderColor: 'var(--aqua-bright)' }} />
            <span className="absolute left-0 top-0 h-2 border-l" style={{ borderColor: 'var(--aqua-bright)' }} />
            <span className="absolute right-0 top-0 h-2 border-r" style={{ borderColor: 'var(--aqua-bright)' }} />
          </span>
          <span>1.0 {SURFACE_PHYSICAL_SCALE.unit}</span>
        </div>
        <div className="font-mono">
          평면 {SURFACE_PHYSICAL_SCALE.planeSideInModelUnits.toFixed(1)} × {SURFACE_PHYSICAL_SCALE.planeSideInModelUnits.toFixed(1)} {SURFACE_PHYSICAL_SCALE.unit} · 높이 Δz {heightSpan.toFixed(3)} {SURFACE_PHYSICAL_SCALE.unit}
        </div>
        <div className="font-mono" style={{ color: 'rgba(245,240,232,0.56)' }}>
          수직 표현 {surfaceVerticalExaggeration.toFixed(1)}배 · 1 모델 단위 = 1 {SURFACE_PHYSICAL_SCALE.unit}
        </div>
      </div>
    </div>
  )
})
