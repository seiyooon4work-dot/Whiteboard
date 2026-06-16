import { DATA_PROVENANCE_META, type DataProvenance } from '../../types/provenance'

type DataProvenanceBadgeProps = {
  type: DataProvenance
  compact?: boolean
  className?: string
}

export function DataProvenanceBadge({ type, compact = false, className = '' }: DataProvenanceBadgeProps) {
  const meta = DATA_PROVENANCE_META[type]

  return (
    <span
      className={`no-split inline-flex items-center rounded-full font-subtitle font-bold ${compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-1 text-[10px]'} ${className}`}
      style={{ color: meta.color, background: meta.background, border: `1px solid ${meta.border}` }}
    >
      {meta.label}
    </span>
  )
}
