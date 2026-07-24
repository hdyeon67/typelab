// 사이트 기본 정보. 배포 도메인은 typecut.fineboll.com.
// ⚠️ 서비스명은 "타입컷". 어떤 성격유형 검사의 상표명도 쓰지 않는다.

export const SITE = {
  name: "타입컷",
  domain: "typecut.fineboll.com",
  description:
    "성향 검사 30분? 여긴 4문항 30초. 테마를 고르고 4문항만 답하면 나를 닮은 동물 캐릭터 유형이 바로 나오는 가장 빠른 유형 테스트. 결과 카드를 친구와 공유하고 케미까지 확인하세요. 재미·참고용이며 심리검사가 아닙니다.",
} as const;

/** 절대 URL 베이스 (OG/공유용). 환경변수 없으면 배포 도메인 기준. */
export function siteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  return `https://${SITE.domain}`;
}
