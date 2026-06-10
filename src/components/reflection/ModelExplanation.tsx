export function ModelExplanation() {
  return (
    <div className="glass-card p-5">
      <p className="section-label mb-1">Model Explanation</p>
      <h3 className="font-display text-lg font-bold text-ivory mb-3">계산 모델 설명</h3>

      <div className="grid gap-4 md:grid-cols-2">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--ivory-dim)' }}>
          This simulator generates a virtual surface as a height map. For each point on the surface,
          the local slope and normal vector are calculated. The incident light vector is reflected
          using the vector reflection equation R = I - 2(I·N)N. The resulting reflection vectors are
          converted into angular distributions, which are then used to estimate specular ratio,
          diffuse ratio, reflection spread, and glare risk.
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--ivory-dim)' }}>
          이 시뮬레이터는 표면을 높이 지도 형태로 생성한 뒤, 각 지점의 기울기와 법선 벡터를
          계산한다. 이후 입사광 벡터와 법선 벡터를 이용해 반사 벡터를 구하고, 반사각 분포를
          분석하여 정반사 비율, 난반사 비율, 반사 확산도, 눈부심 위험도를 계산한다.
        </p>
      </div>
    </div>
  )
}
