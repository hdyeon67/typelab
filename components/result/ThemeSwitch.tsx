"use client";

import { useRouter } from "next/navigation";
import { THEMES } from "@/lib/typelab-engine";
import { track } from "@/lib/analytics";

/** 다른 테마도 해보기 — 시리즈 순환(재방문 유도). 현재 테마는 제외. */
export function ThemeSwitch({ currentTheme }: { currentTheme: string }) {
  const router = useRouter();
  const others = THEMES.filter((t) => t.themeId !== currentTheme);
  if (others.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-ink-soft text-center text-xs font-bold">다른 테마도 해보기</h2>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {others.map((t) => (
          <button
            key={t.themeId}
            onClick={() => {
              track("theme_switch", { theme: t.themeId });
              router.push(`/quiz?t=${t.themeId}`);
            }}
            className="border-ink/15 hover:border-pop text-ink rounded-xl border-2 bg-white px-4 py-3 text-sm font-bold transition active:translate-y-[1px]"
          >
            {t.title} →
          </button>
        ))}
      </div>
    </section>
  );
}
