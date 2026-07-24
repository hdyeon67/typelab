// 계측 헬퍼 (app="typelab"). 메인: PostHog(쿠키리스 memory persistence).
//   원칙: 개인정보 미저장 — 이벤트 속성에 입력값·식별정보 절대 포함 금지.
//   핵심 지표: 랜딩→theme_start 전환율, quiz_complete 완주율(4문항이라 높아야 정상).
// PostHog 스크립트는 키가 있을 때만 로드되므로(AnalyticsProvider), 키 없으면 track() 은 no-op.

type PostHog = { capture: (event: string, props?: Record<string, unknown>) => void };

declare global {
  interface Window {
    posthog?: PostHog;
  }
}

/** typelab 이벤트 (dev 프롬프트 §계측) */
export type TypelabEvent =
  | "landing_view"
  | "theme_start" // { theme }
  | "quiz_complete" // { theme }
  | "result_view" // { type_code }
  | "share_click" // { channel }
  | "cta_friend_click"
  | "theme_switch" // 다른 테마로 이동
  | "cross_banner_click"; // { target }

/** 이벤트 전송 (키 없으면 no-op). PII 금지 — 호출부에서 비식별 속성만 전달할 것. */
export function track(event: TypelabEvent, props: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  try {
    window.posthog?.capture(event, { app: "typelab", ...props });
  } catch {
    /* 계측 실패는 조용히 무시 */
  }
}

/** document.referrer → 유입 유형 분류 (구체 URL 미전송) */
export function referrerType(): "sns" | "search" | "cross" | "direct" {
  if (typeof document === "undefined") return "direct";
  const ref = document.referrer;
  if (!ref) return "direct";
  let host = "";
  try {
    host = new URL(ref).hostname;
  } catch {
    return "direct";
  }
  if (/(t\.co|twitter|x\.com|instagram|threads|facebook|kakao|band|tiktok|youtube)/i.test(host))
    return "sns";
  if (/(google|naver|daum|bing|yahoo|duckduckgo)/i.test(host)) return "search";
  if (/fineboll\.com$/i.test(host)) return "cross";
  return "direct";
}
