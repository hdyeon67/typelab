// 타입컷 브랜드 색 — **단일 출처(single source of truth)**.
// (부적에서 먼저 정립한 "계단" 패턴을 그대로 적용. 2026-07-28)
//
// 문제: 브랜드 주황·빨강이 서로의 관계 없이 흩어져 있었다.
//   tailwind pop #ff8a5c · pop.deep #f26a3a · 아이콘/PWA 토마토 #d8402b(토큰에 이름 없음) ·
//   globals --primary hsl(20 90% 62%)=#f58147(어느 토큰과도 다른 4번째 값).
// 값은 하나도 바꾸지 않는다 — 이미 라이브에 나가 있는 색이다. 이름·역할·관계만 고정한다.
//
// 계단(밝음 → 어두움). hue 38.5~47.3° 로 한 계열이고 명도만 내려간다.
//   light  #ff8a5c  L* 69.6  살구 포인트 — 칩·강조·보조 버튼
//   deep   #f26a3a  L* 61.2  호버·프레스
//   dark   #d8402b  L* 50.0  아이덴티티 — 앱 아이콘·PWA 테마·워드마크 "컷" 크롭마크
//
// 대비(크림 #fff6e9 기준): light 2.17:1 · deep 2.84:1 · dark 4.18:1
//   → **크림 위 텍스트에는 light/deep 을 쓰지 말 것.** 둘 다 AA 라지(3:1) 미달이다.
//     크림 위 색 텍스트가 필요하면 dark, 아니면 잉크(--ink)를 쓴다.
//     light/deep 은 "면"(칩 배경·버튼 채움 위 흰 글자)에서 쓰라고 만든 색이다.
//
// 연한 배경은 새 토큰을 만들지 말고 알파 유틸리티로 (`bg-pop/10`, `border-pop/40`).
//
// 미러 주의 — 아래는 이 모듈을 import 할 수 없다(정적 파일):
//   app/icon.svg (배경 fill = dark) · app/globals.css (--primary = light)
//   → lib/config/__tests__/brand.test.ts 가 드리프트를 잡는다.
//
// ⚠️ 채널 중복(미해결): 앱인토스판 typelab-ait 이 같은 값을 자기 tailwind 에 복사해 갖고 있다.
//    장기적으로는 typelab-core(src/theme/)가 두 채널의 공통 출처가 되는 게 맞지만,
//    앱인토스 심사 준비 중이라 이번엔 건드리지 않았다(2026-07-28 판단).

export const BRAND = {
  /** 살구 포인트 — 칩·강조·보조 버튼(면 위주) */
  light: "#ff8a5c",
  /** 호버·프레스 */
  deep: "#f26a3a",
  /** 아이덴티티 — 아이콘·PWA 테마·워드마크 크롭마크(크림 위 4.18:1) */
  dark: "#d8402b",
} as const;

/** 크림 배경 */
export const CREAM = "#fff6e9";
/** 잉크 — 본문·외곽선 */
export const INK = "#2c2a3a";

export type BrandStep = keyof typeof BRAND;
