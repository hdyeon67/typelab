import type { Config } from "tailwindcss";

// 타입컷 디자인 토큰 (도담 검수 2026-07-24).
// 밝은 파스텔 + 잉크 외곽선(에셋 스타일 통일). 결과 카드=세로 3:4, 캐릭터가 주인공.
// 4기질(NT/NF/SJ/SP) 가족색은 globals.css 의 HSL 토큰 + lib/theme/colors.ts 에서 관리.
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
          DEFAULT: "#fff6e9", // 크림 배경 (에셋 배경과 통일)
          soft: "#fffaf2",
          deep: "#f6ead6",
        },
        ink: {
          DEFAULT: "#2c2a3a", // 잉크 외곽선/텍스트
          soft: "#5a5768",
          faint: "#8f8ca0",
        },
        pop: {
          DEFAULT: "#ff8a5c", // 따뜻한 포인트(살구빛)
          deep: "#f26a3a",
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
