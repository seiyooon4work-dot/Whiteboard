export type DataProvenance = 'measured' | 'estimated' | 'regression' | 'simulated'

export const DATA_PROVENANCE_META: Record<
  DataProvenance,
  { label: string; color: string; background: string; border: string }
> = {
  measured: {
    label: '실험값',
    color: '#7FEEE2',
    background: 'rgba(79,216,200,0.10)',
    border: 'rgba(79,216,200,0.30)',
  },
  estimated: {
    label: '추정값',
    color: '#FFB870',
    background: 'rgba(255,138,61,0.10)',
    border: 'rgba(255,138,61,0.30)',
  },
  regression: {
    label: '회귀 예측',
    color: '#A995FF',
    background: 'rgba(139,111,232,0.12)',
    border: 'rgba(139,111,232,0.32)',
  },
  simulated: {
    label: '시뮬레이션',
    color: '#8FB5FF',
    background: 'rgba(123,152,207,0.12)',
    border: 'rgba(123,152,207,0.32)',
  },
}
