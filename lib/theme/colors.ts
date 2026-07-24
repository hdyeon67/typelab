// 4기질(NT/NF/SJ/SP) 가족색 시스템 (도담 검수 확정 2026-07-24).
// 동물 개별색이 아니라 기질별 가족색을 공유한다. 카드/OG 배경=bg, 배지·칩·코드=accent.
// globals.css 의 CSS 변수와 값이 일치해야 한다.

import type { Temperament } from "@/lib/typelab-engine";

export interface TemperamentColor {
  /** 카드·OG 배경 (연한 파스텔) */
  bg: string;
  /** 배지·칩·코드 (진한 포인트) */
  accent: string;
  /** 기질 그룹 라벨 */
  group: string;
  /** 가족색 이름 */
  family: string;
}

export const TEMPERAMENT_COLORS: Record<Temperament, TemperamentColor> = {
  NT: { bg: "hsl(268 45% 94%)", accent: "hsl(268 50% 64%)", group: "분석가", family: "라벤더" },
  NF: { bg: "hsl(158 42% 93%)", accent: "hsl(160 46% 46%)", group: "외교관", family: "민트" },
  SJ: { bg: "hsl(206 52% 93%)", accent: "hsl(208 58% 56%)", group: "관리자", family: "스카이" },
  SP: { bg: "hsl(20 88% 93%)", accent: "hsl(12 78% 64%)", group: "탐험가", family: "애프리콧" },
};

export function colorFor(temperament: Temperament): TemperamentColor {
  return TEMPERAMENT_COLORS[temperament];
}
