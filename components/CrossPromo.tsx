"use client";

import { promosFor } from "@/lib/config/promos";
import { track } from "@/lib/analytics";

/** 결과 하단 크로스 프로모션 배너 (맥락 매칭 최대 2슬롯). */
export function CrossPromo({ themeId, seed }: { themeId: string; seed: number }) {
  const promos = promosFor(themeId, seed);
  if (promos.length === 0) return null;
  return (
    <section>
      <h2 className="text-ink-soft text-center text-xs font-bold">이런 것도 있어요</h2>
      <div className="mt-3 space-y-2.5">
        {promos.map((p) => (
          <a
            key={p.id}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("cross_banner_click", { target: p.id })}
            className="sticker flex items-center gap-3 p-3.5 transition active:translate-x-[1px] active:translate-y-[1px]"
          >
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-xl text-xl"
              style={{ backgroundColor: `${p.color}22` }}
            >
              {p.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-ink block text-sm font-bold">{p.title}</span>
              <span className="text-ink-faint block truncate text-xs">{p.desc}</span>
            </span>
            <span className="text-ink-faint text-lg">›</span>
          </a>
        ))}
      </div>
    </section>
  );
}
