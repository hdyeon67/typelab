import type { Config } from "tailwindcss";
import { BRAND, CREAM, INK } from "./lib/config/brand";

// 타입컷 디자인 토큰 (도담 검수 2026-07-24).
// 밝은 파스텔 + 잉크 외곽선(에셋 스타일 통일). 결과 카드=세로 3:4, 캐릭터가 주인공.
// 4기질(NT/NF/SJ/SP) 가족색은 globals.css 의 HSL 토큰 + typelab-core 의 theme/colors 에서 관리.
// ⚠️ 브랜드 계단(pop)은 lib/config/brand.ts 가 단일 출처다 — 여기에 새 값을 직접 적지 말 것.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: CREAM, // 크림 배경 (에셋 배경과 통일)
          soft: "#fffaf2",
          deep: "#f6ead6",
        },
        ink: {
          DEFAULT: INK, // 잉크 외곽선/텍스트
          soft: "#5a5768",
          faint: "#8f8ca0",
        },
        // 계단(밝음→어두움). DEFAULT=light 라 기존 `bg-pop` 클래스는 그대로 동작한다.
        pop: {
          DEFAULT: BRAND.light, // 따뜻한 포인트(살구빛)
          light: BRAND.light,
          deep: BRAND.deep,
          dark: BRAND.dark, // 아이덴티티 토마토(아이콘·PWA) — 크림 위 텍스트는 이 단계부터
        },
      },
      fontFamily: {
        sans: ["Pretendard", "ui-sans-serif", "system-ui", "sans-serif"],
        hand: ["'Gaegu'", "Pretendard", "cursive"],
      },
      boxShadow: {
        pop: "5px 5px 0 0 rgba(44,42,58,0.14)",
        popsm: "3px 3px 0 0 rgba(44,42,58,0.14)",
      },
      aspectRatio: {
        card: "3 / 4",
      },
    },
  },
  plugins: [],
};

export default config;
