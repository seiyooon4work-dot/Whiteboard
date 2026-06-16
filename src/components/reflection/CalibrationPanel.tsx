import type { CalibrationSample } from '../../types/simulation'
import { CALIBRATION_SAMPLES } from '../../lib/calibration'
import { DataProvenanceBadge } from '../ui/DataProvenanceBadge'

type CalibrationPanelProps = {
  onApplyMaterial?: (sample: CalibrationSample) => void
}

export function CalibrationPanel({ onApplyMaterial }: CalibrationPanelProps) {
  return (
    <div className="glass-card p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div>
          <p className="section-label mb-1">Calibration Data</p>
          <h3 className="font-display text-lg font-bold text-ivory">실험값 보정 데이터</h3>
        </div>
        <DataProvenanceBadge type="measured" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead style={{ color: 'var(--ivory-dim)' }}>
            <tr className="border-b" style={{ borderColor: 'rgba(46,63,102,0.6)' }}>
              <th className="py-2 font-subtitle">material</th>
              <th className="py-2 font-subtitle">rough</th>
              <th className="py-2 font-subtitle">groove</th>
              <th className="py-2 font-subtitle">aniso</th>
              <th className="py-2 font-subtitle">specular</th>
              <th className="py-2 font-subtitle">diffuse</th>
              <th className="py-2 font-subtitle">erase</th>
              <th className="py-2 font-subtitle">visible</th>
              <th className="py-2 font-subtitle">apply</th>
            </tr>
          </thead>
          <tbody className="font-mono" style={{ color: 'var(--ivory)' }}>
            {CALIBRATION_SAMPLES.map((row) => (
              <tr key={row.materialName} className="border-b" style={{ borderColor: 'rgba(46,63,102,0.28)' }}>
                <td className="py-2">{row.materialName}</td>
                <td className="py-2">{row.roughnessIndex.toFixed(3)}</td>
                <td className="py-2">{row.grooveIndex.toFixed(3)}</td>
                <td className="py-2">{row.anisotropyIndex.toFixed(3)}</td>
                <td className="py-2">{row.measuredSpecularRatio.toFixed(3)}</td>
                <td className="py-2">{row.measuredDiffuseRatio.toFixed(3)}</td>
                <td className="py-2">{row.measuredErasability.toFixed(3)}</td>
                <td className="py-2">{row.measuredVisibility.toFixed(3)}</td>
                <td className="py-2">
                  <button
                    type="button"
                    onClick={() => onApplyMaterial?.(row)}
                    className="no-split rounded-md px-2 py-1 font-subtitle text-[10px] uppercase tracking-wider"
                    style={{
                      border: '1px solid rgba(79,216,200,0.32)',
                      color: 'var(--aqua-bright)',
                      background: 'rgba(79,216,200,0.08)',
                    }}
                  >
                    use
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs leading-relaxed" style={{ color: 'var(--ivory-dim)' }}>
        이 측정값은 3D 표면 적용과 최적화 점수 보정에 함께 사용됩니다. use를 누르면 해당 재질에 가까운 표면 조건이 3D 시뮬레이터에 적용됩니다.
      </p>
    </div>
  )
}
