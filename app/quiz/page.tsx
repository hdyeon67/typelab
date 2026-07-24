import { Suspense } from "react";
import { QuizRunner } from "@/components/quiz/QuizRunner";

export const metadata = {
  title: "유형 테스트 중",
};

// 테마별 문항을 클라이언트에서 렌더하므로 정적 프리렌더 금지.
export const dynamic = "force-dynamic";

export default function QuizPage() {
  return (
    <Suspense
      fallback={<div className="text-ink-faint mx-auto max-w-md px-5 py-10 text-center">불러오는 중…</div>}
    >
      <QuizRunner />
    </Suspense>
  );
}
