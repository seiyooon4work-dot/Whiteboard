// ─── src/data/materials.ts ───────────────────────────────────────────────────
// 시뮬레이션에 사용할 6가지 재질 프리셋 데이터
// 보이는 정도: 보고서 주관적 가독성 평균값 (실측)
// 마찰계수 μ: 예시값 — 실제 측정값으로 교체 가능

export interface Material {
  id: string
  name: string           // 한글 이름
  nameEn: string         // 영문 이름
  visibility: number     // 보이는 정도 0~10 (실측값)
  mu: number             // 마찰계수 μ (예시값)
  isEstimated: boolean   // μ가 예시값인지 여부
  description: string    // 짧은 설명
  accentColor: string    // 카드 액센트 색 (HEX)
  rank: number           // 가독성 순위 (1=최우수)
}

export const MATERIALS: Material[] = [
  {
    id: 'woodrac',
    name: '우드락',
    nameEn: 'Foam Board',
    visibility: 7.03,
    mu: 0.70,
    isEstimated: true,
    description: '거친 표면이 빛을 고르게 흩어뜨려 가장 잘 보입니다',
    accentColor: '#4FD8C8',
    rank: 1,
  },
  {
    id: 'school-wb',
    name: '학교 화이트보드',
    nameEn: 'School Whiteboard',
    visibility: 6.53,
    mu: 0.22,
    isEstimated: true,
    description: '현재 교실에서 사용 중인 기본 화이트보드',
    accentColor: '#8B6FE8',
    rank: 2,
  },
  {
    id: 'regular-wb',
    name: '일반 화이트보드',
    nameEn: 'Regular Whiteboard',
    visibility: 6.43,
    mu: 0.28,
    isEstimated: true,
    description: '시중의 표준 화이트보드. 학교 것과 비슷한 성능',
    accentColor: '#7B98CF',
    rank: 3,
  },
  {
    id: 'paper-film',
    name: '종이 질감 필름',
    nameEn: 'Paper Texture Film',
    visibility: 5.54,
    mu: 0.55,
    isEstimated: true,
    description: '종이처럼 무광 질감. 중간 거칠기로 반사를 일부 줄임',
    accentColor: '#D4B483',
    rank: 4,
  },
  {
    id: 'anti-finger',
    name: '지문 방지 필름',
    nameEn: 'Anti-Fingerprint Film',
    visibility: 5.41,
    mu: 0.45,
    isEstimated: true,
    description: '무광 처리로 지문이 덜 남지만 가시성은 평범한 수준',
    accentColor: '#6AADCE',
    rank: 5,
  },
  {
    id: 'acrylic',
    name: '아크릴판',
    nameEn: 'Acrylic Panel',
    visibility: 4.91,
    mu: 0.18,
    isEstimated: true,
    description: '매우 매끄러워 번쩍임이 가장 심함. 특정 자리에서 글씨 거의 안 보임',
    accentColor: '#FF8A3D',
    rank: 6,
  },
]

// 설문 조사 데이터 (섹션 2 연출용)
export const SURVEY_DATA = {
  totalRespondents: 120,
  cantSeePercent: 91.7,

  // 가시성 방해 원인 분포
  causes: [
    { label: '빛 반사',       percent: 34.6, color: '#FF8A3D' },
    { label: '앞 장애물',     percent: 22.3, color: '#FFB870' },
    { label: '자리 위치',     percent: 18.5, color: '#8B6FE8' },
    { label: '보드마카 잉크', percent: 6.2,  color: '#6AADCE' },
    { label: '빔 프로젝터',   percent: 6.2,  color: '#6AADCE' },
    { label: '기타',          percent: 12.3, color: '#4A5580' },
  ],

  // 잘 안 보인다고 응답한 좌석 (복수 선택, %)
  // 새 배치 기준: 1~4번 앞줄, 5~8번 뒷줄
  seatComplaints: [
    { id: 4, name: '4번', percent: 44.2 },
    { id: 1, name: '1번', percent: 35.8 },
    { id: 5, name: '5번', percent: 27.5 },
    { id: 8, name: '8번', percent: 12.5 },
    { id: 7, name: '7번', percent: 11.7 },
    { id: 9, name: 'ST',  percent: 7.5  },  // 스탠딩 테이블
    { id: 6, name: '6번', percent: 0.8  },
    { id: 2, name: '2번', percent: 0    },
    { id: 3, name: '3번', percent: 0    },
  ],
}
