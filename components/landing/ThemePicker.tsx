"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { THEMES } from "@/lib/typelab-engine";
import { track, referrerType } from "@/lib/analytics";

/** 테마 표시 메타 (엔진 Theme 에 없는 이모지·태그라인). */
const THEME_META: Record<string, { emoji: string; tagline: string }> = {
  base: { emoji: "🧭", tagline: "요즘 나 사용설명서 · 첫 진입엔 이걸로" },
  love: { emoji: "💘", tagline: "같은 나를 연애 상황으로 · 케미까지" },
  exam: { emoji: "📚", tagline: "시험기간의 나 · 수능 시즌 훅" },
};

/** 랜딩 — 테마 카드 3개. 입력 없이 바로 시작. */
export function ThemePicker() {
  const router = useRouter();

  useEffect(() => {
    track("landing_view", { referrer_type: referrerType() });
  }, []);

  function start(themeId: string) {
    track("theme_start", { theme: themeId });
    router.push(`/quiz?t=${themeId}`);
  }

  return (
    <div className="w-full max-w-md space-y-3">
      {THEMES.map((t) => {
        const meta = THEME_META[t.themeId] ?? { emoji: "✨", tagline: "" };
        return (
          <button
            key={t.themeId}
            onClick={() => start(t.themeId)}
            className="sticker animate-fade-up flex w-full items-center gap-4 p-5 text-left transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <span className="bg-cream-deep flex size-14 shrink-0 items-center justify-center rounded-2xl text-3xl">
              {meta.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-ink block text-lg font-black">{t.title}</span>
              <span className="text-ink-faint block text-xs">{meta.tagline}</span>
            </span>
            <span className="text-pop-deep text-xl font-bold">→</span>
          </button>
        );
      })}
    </div>
  );
}
