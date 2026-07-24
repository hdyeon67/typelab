"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Answer, Axis, ThemeQuestion } from "@/lib/typelab-engine";
import { getTheme, BASE_THEME, buildQuestionSet } from "@/lib/typelab-engine";
import { encodeResult } from "@/lib/share/encode";
import { track } from "@/lib/analytics";
import { AXIS_DEFS } from "@/lib/typelab-engine/axes";

// 직전에 뽑은 변형 인덱스 기억(모듈 스코프, 영속 저장 아님) — 재응시 시 같은 변형 반복 완화.
const lastPick: Record<string, number> = {};

function pickAvoidLast(key: string, len: number): number {
  let i = Math.floor(Math.random() * len);
  // 풀이 2개 이상이고 직전과 같으면 1회만 다시 뽑는다(충분).
  if (len >= 2 && i === lastPick[key]) i = Math.floor(Math.random() * len);
  lastPick[key] = i;
  return i;
}

export function QuizRunner() {
  const router = useRouter();
  const params = useSearchParams();
  const themeId = params.get("t") ?? "base";
  const theme = useMemo(() => getTheme(themeId) ?? BASE_THEME, [themeId]);

  // 문항 세트는 마운트 후 1회 확정(랜덤이 SSR 과 충돌해 하이드레이션 깨지는 것 방지).
  const [questions, setQuestions] = useState<ThemeQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);

  useEffect(() => {
    const set = buildQuestionSet(theme, (axis: Axis, len: number) =>
      pickAvoidLast(`${theme.themeId}:${axis}`, len),
    );
    setQuestions(set);
    setIdx(0);
    setAnswers([]);
  }, [theme]);

  const total = questions.length;

  if (total === 0) {
    return <div className="text-ink-faint mx-auto max-w-md px-5 py-10 text-center">문제 준비 중…</div>;
  }

  const q = questions[idx];
  const progress = Math.round((idx / total) * 100);

  function choose(answer: Answer) {
    const next = answers.slice();
    next[idx] = answer;
    setAnswers(next);
    if (idx < total - 1) {
      setIdx(idx + 1);
    } else {
      finish(next);
    }
  }

  function finish(finalAnswers: Answer[]) {
    track("quiz_complete", { theme: theme.themeId });
    // answers 는 제시 순서(=축 순서)대로 저장돼 있으므로 그대로 인코딩(변형 정보 미저장).
    const d = encodeResult({ theme: theme.themeId, answers: finalAnswers });
    router.push(`/result?d=${d}`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-6">
      {/* 진행 바 */}
      <div className="text-ink-soft mb-1 flex items-center justify-between text-xs font-medium">
        <button
          onClick={() => idx > 0 && setIdx(idx - 1)}
          disabled={idx === 0}
          className="disabled:opacity-30"
          aria-label="이전 문항"
        >
          ← 이전
        </button>
        <span className="font-bold">
          {idx + 1} / {total}
        </span>
        <Link href="/" className="text-ink-faint hover:text-pop-deep">
          그만두기
        </Link>
      </div>
      <div className="bg-cream-deep h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-pop h-full rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 문항 */}
      <div key={idx} className="animate-fade-up mt-6 flex-1">
        <span className="bg-pop/15 text-pop-deep inline-block rounded-full px-3 py-1 text-xs font-bold">
          {AXIS_DEFS[q.axis].dimension}
        </span>

        <h2 className="text-ink mt-3 text-xl font-bold leading-snug">{q.prompt}</h2>

        <div className="mt-6 space-y-3">
          {([
            [0, q.optFirst],
            [1, q.optSecond],
          ] as const).map(([value, text]) => {
            const selected = answers[idx] === value;
            return (
              <button
                key={value}
                onClick={() => choose(value as Answer)}
                className={`w-full rounded-2xl border-2 px-5 py-4 text-left text-[15px] leading-snug transition active:translate-x-[1px] active:translate-y-[1px] ${
                  selected
                    ? "border-pop bg-pop/10 text-ink"
                    : "border-ink/12 hover:border-pop/50 text-ink bg-white"
                }`}
              >
                {text}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-ink-faint mt-6 text-center text-[11px]">
        답을 고르면 다음 문항으로 넘어가요 · 4문항 30초
      </p>
    </main>
  );
}
