import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/content/guides";

export const metadata: Metadata = {
  title: "가이드",
  description: "성향 테스트와 유형별 공부법 가이드. 4문항 30초로 내 유형을 확인해요.",
};

export default function GuideIndex() {
  return (
    <main className="mx-auto w-full max-w-md px-5 py-8">
      <h1 className="text-ink text-2xl font-black">가이드</h1>
      <p className="text-ink-soft mt-2 text-sm">유형과 관련한 이야기들. 가볍게 읽어 보세요.</p>

      <div className="mt-6 space-y-3">
        {GUIDES.map((g) => (
          <Link
            key={g.slug}
            href={`/guide/${encodeURIComponent(g.slug)}`}
            className="sticker flex items-center gap-3 p-4 transition active:translate-x-[1px] active:translate-y-[1px]"
          >
            <span className="bg-cream-deep flex size-11 shrink-0 items-center justify-center rounded-xl text-xl">
              {g.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-ink block text-sm font-bold">{g.title}</span>
              <span className="text-ink-faint block truncate text-xs">{g.keyword}</span>
            </span>
            <span className="text-ink-faint text-lg">›</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
