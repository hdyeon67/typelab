"use client";

import { useEffect, useRef, useState } from "react";
import type { ResultCopy } from "@/lib/content/select";
import { colorFor } from "@/lib/theme/colors";
import { emojiFor } from "@/lib/content/emoji";

/** 확신도 라벨 (퍼센트 미표기). */
const CONF_LABEL: Record<string, string> = {
  clear: "뚜렷한 유형",
  balanced: "균형 잡힌 유형",
  edge: "경계에 걸친 유형",
};

/**
 * 결과 캐릭터 카드 (세로 3:4, 캐릭터가 주인공).
 * /public/types/{code}.png 를 쓰되, 없으면 (기질 가족색 + 동물 이모지 + 캐릭터명) 폴백.
 * bujeok ResultBujeok 패턴: onError + 하이드레이션 전 로드 실패(complete && naturalWidth===0) 감지.
 */
export function ResultCard({ copy }: { copy: ResultCopy }) {
  const color = colorFor(copy.temperament);
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const src = `/types/${copy.code.toLowerCase()}.png`;

  // 코드가 바뀌면 실패 상태 초기화
  useEffect(() => setFailed(false), [copy.code]);

  // 하이드레이션 이전에 이미 로드(실패)된 이미지를 잡는다 — onError 로는 놓치는 케이스.
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, [copy.code]);

  return (
    <div
      className="animate-pop-in mx-auto w-full max-w-[340px] overflow-hidden border-[3px] border-ink"
      style={{ backgroundColor: color.bg, borderRadius: 24, boxShadow: "5px 5px 0 0 rgba(44,42,58,0.14)" }}
    >
      {/* 캐릭터 영역 (약 55%) */}
      <div className="relative flex items-center justify-center" style={{ aspectRatio: "1 / 1" }}>
        {!failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgRef}
            src={src}
            alt={copy.animal}
            className="h-full w-full object-contain p-3"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <span
              className="flex size-28 items-center justify-center rounded-full text-6xl"
              style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
            >
              {emojiFor(copy.code)}
            </span>
            <span className="text-ink-faint mt-2 text-[11px]">
              ({copy.code.toLowerCase()}.png 준비 중)
            </span>
          </div>
        )}
      </div>

      {/* 이름 + 코드 배지 + 정체성 */}
      <div className="bg-white/70 px-5 pb-5 pt-4 text-center backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-ink text-2xl font-black">{copy.animal}</h2>
          <span
            className="rounded-lg px-2 py-0.5 text-xs font-black text-white"
            style={{ backgroundColor: color.accent }}
          >
            {copy.code}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] font-bold" style={{ color: color.accent }}>
          {color.group} 유형
        </p>

        {/* 확신도 뱃지 — 라벨 + 강축 수만큼 채운 점 4개 (퍼센트 없음) */}
        <div className="mt-2 flex items-center justify-center gap-2">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ backgroundColor: color.bg, color: color.accent }}
          >
            {CONF_LABEL[copy.confidence.level]}
          </span>
          <span className="flex gap-0.5" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="size-1.5 rounded-full"
                style={{
                  backgroundColor: i < copy.confidence.strongCount ? color.accent : "rgba(44,42,58,0.15)",
                }}
              />
            ))}
          </span>
        </div>

        <p className="text-ink-soft mt-2 text-sm leading-relaxed">{copy.identity}</p>
      </div>
    </div>
  );
}
