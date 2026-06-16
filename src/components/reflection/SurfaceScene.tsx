import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { memo, useMemo } from 'react'
import * as THREE from 'three'
import type { ReflectionSample, SurfaceData } from '../../types/simulation'

type SurfaceSceneProps = {
  surface: SurfaceData
  samples: ReflectionSample[]
  compact?: boolean
}

function toScenePoint(x: number, y: number, z: number): [number, number, number] {
  return [x * 3, z * 4.8, y * 3]
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
  return (
    <div
      className={`relative ${compact ? 'h-[260px] sm:h-[340px]' : 'h-[420px] sm:h-[560px]'} overflow-hidden rounded-2xl`}
      style={{ border: '1px solid rgba(46,63,102,0.72)', background: '#080A12' }}
    >
      <div className="h-full w-full pointer-events-none sm:pointer-events-auto">
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

      <div className="absolute left-4 top-4 flex gap-3 text-xs font-mono">
        <span className="rounded-full px-3 py-1" style={{ background: 'rgba(255,138,61,0.12)', color: 'var(--amber-bright)' }}>
          입사광
        </span>
        <span className="rounded-full px-3 py-1" style={{ background: 'rgba(79,216,200,0.12)', color: 'var(--aqua-bright)' }}>
          반사광
        </span>
      </div>
    </div>
  )
})
