// OG 공유 카드 URL 결정 — 도담 정적 카드 우선, 없으면 동적 /api/og 폴백.
// 정적 카드: public/og-types/{코드소문자}.jpg (도담 16장 렌더 완료).
// 동적 폴백: /api/og?d= (satori). 둘 다 절대 URL(카카오·OG는 절대 URL 필요).

import { siteUrl } from "./site";

/** 정적 OG 카드가 준비된 코드 집합. 16종 전량 렌더 완료(public/og-types/). */
export const OG_TYPES_READY: ReadonlySet<string> = new Set([
  "INTJ", "INTP", "ENTP", "ENTJ",
  "INFJ", "INFP", "ENFP", "ENFJ",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
]);

/**
 * 결과 OG 이미지 절대 URL.
 * 정적 카드가 준비된 코드면 /og-types/{code}.jpg, 아니면 동적 /api/og?d= 폴백.
 */
export function ogImageFor(code: string, d: string): string {
  const base = siteUrl();
  if (OG_TYPES_READY.has(code)) {
    return `${base}/og-types/${code.toLowerCase()}.jpg`;
  }
  return `${base}/api/og?d=${encodeURIComponent(d)}`;
}
