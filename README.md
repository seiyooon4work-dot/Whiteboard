# 화이트보드 가시성 시뮬레이션 대시보드
**HAFS Eureka 연구 프로젝트 — 교실 화이트보드 가시성 개선 연구 (2026)**

> "왜 어떤 자리에서는 칠판 글씨가 잘 안 보일까?  
> 그리고 어떻게 하면 모두에게 잘 보이게 할 수 있을까?"

---

## ⚡ 빠른 시작

```bash
cd whiteboard-simulation
nvm use
npm install
npm run dev
```

브라우저에서 `http://127.0.0.1:5176/` 열기

> 5176은 확인용 단일 포트입니다. 이미 사용 중이면 다른 포트로 넘어가지 않고 실패합니다.
> 이 프로젝트는 Node 22 LTS 기준입니다. 화면이 꼬여 보이면 `npm run dev:clean`으로 5176 캐시를 지운 뒤 다시 실행합니다.

### Node/Vite 환경 정리

현재 시스템 기본 Node가 24라면 Vite나 TypeScript가 멈출 수 있습니다. 이 프로젝트 폴더에서는 Node 22를 사용하세요.

```bash
nvm install 22
nvm use
node -v
npm ci
npm run dev
```

`node -v`가 `v22.x.x`로 나오면 정상입니다.

---

## 🔬 시뮬레이션 모델 설명

시뮬레이션은 `src/lib/simulation.ts`의 순수 함수로 구현되어 있습니다.

### 입력값
| 변수 | 설명 | 범위 |
|------|------|------|
| `μ` (마찰계수) | 빗면 기울임각 θ에서 μ = tan(θ)로 계산 | 0.05 ~ 1.00 |
| `visibility` (가독성 점수) | 여러 자리에서 글씨가 얼마나 잘 보이는지 | 0 ~ 10 |

### 계산 단계
```
1. 거칠기 지수   r  = (μ - 0.05) / 0.95                    (0~1 정규화)
2. 난반사 비율   D  = 1 - exp(-3·r)
3. 정반사 비율   S  = 1 - D
4. 확산폭        ψ  = 0.15 + 0.65·r
5. 좌석 글레어   Gᵢ = S · exp(-Δθᵢ² / 2ψ²)               (가우시안 분포)
6. 좌석 가시성   Vᵢ = 기본대비 · (0.3 + 0.7·D) / (1 + 2·Gᵢ) · (1 - 0.25·r)
7. 지움성        E  = 1 / (1 + 3·r)
8. 종합 품질     Q  = (0.7·평균Vᵢ + 0.3·E) × 100
```

### 좌석 배치
8개 구역 + 스탠딩 테이블이 교실 평면에 배치됩니다.  
설문에서 1·7·8번이 취약했던 경향과 일치하도록 정반사 방향에서 벗어난 각도(Δθ)를 설정했습니다.

---

## 🎨 디자인 시스템

| 색상 | 의미 | 사용처 |
|------|------|--------|
| `#FF8A3D` (Amber) | 문제·번쩍임·안 보임 | 글레어 강한 자리, 경고 배지 |
| `#4FD8C8` (Aqua)  | 좋음·잘 보임·해결 | 가시성 높은 자리, 추천 배지 |
| `#8B6FE8` (Violet) | 빛 산란·보조 | 확산 표현 |

**이 색 규칙은 사이트 전체에서 한 번도 어기지 않습니다.**

---

## 📁 폴더 구조

```
src/
├── data/
│   └── materials.ts         # 6가지 재질 프리셋 + 설문 데이터
├── lib/
│   └── simulation.ts        # 순수 계산 함수 (한국어 주석)
├── hooks/
│   ├── useReducedMotion.ts  # prefers-reduced-motion
│   ├── useInView.ts         # IntersectionObserver
│   └── useSimulation.ts     # 시뮬레이션 상태 관리
├── components/
│   ├── nav/ProgressNav.tsx  # 고정 진행 표시기
│   ├── canvas/ParticleField.tsx  # 배경 파티클
│   ├── ui/                  # 재사용 UI (Tooltip, CountUp, GlowBadge, SliderInput)
│   └── simulation/          # 시뮬레이션 서브컴포넌트
└── sections/                # 섹션 0~7
```

---

## 🧩 연구 흐름과 시뮬레이션 연결

```
설문 조사    →  "빛 반사가 가장 큰 원인이다"
     ↓
주관적 가독성 →  재질별 '보이는 정도' 측정 (visibility 입력)
     ↓
표면 거칠기  →  마찰 각도 측정 → μ 계산 (friction 입력)
     ↓
시뮬레이션   →  두 값을 통합해 최적 재질을 수치로 결론
```

---

## 📦 기술 스택

| 라이브러리 | 용도 |
|----------|------|
| Vite + React + TypeScript | 빌드 |
| Tailwind CSS | 스타일 |
| Motion (`motion/react`) | 컴포넌트 애니메이션·스프링 물리 |
| GSAP + ScrollTrigger | 스크롤 연동 pin 효과 |
| Lenis | 관성 스크롤 |
| Canvas 2D | 파티클 필드 |

> 외부 차트 라이브러리 없음 — 모든 그래프는 SVG로 직접 구현

---

## 👥 연구팀

**HANKUK ACADEMY OF FOREIGN STUDIES**

- **Leader**: Seiyoon Chang
- **Members**: Jay Joo · Inseo Jeong · Wooshin Choi · Yoonhan Hwang

June, 2026
