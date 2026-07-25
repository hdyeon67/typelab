// 결과 공유 인코딩 — ?d= base64url.
// DB 없이 URL 만으로 결과를 재현한다. 개인정보는 저장하지 않고, 재현에 필요한
// 값(테마 + 답안 4개)만 담는다. 답안은 축당 0~3(0·1=first, 2·3=second)이라 시드조차 필요 없다(순수 결정적).
// btoa/atob + TextEncoder/TextDecoder 로 브라우저·Cloudflare Workers·Node 공용.

import type { Answer } from "@/lib/typelab-engine";

export interface ResultPayload {
  /** 테마 id (base | love | exam ...) */
  theme: string;
  /** 문항별 답 0~3(0·1=first, 2·3=second), 문항 순서(=축 순서) 정렬. 길이 4. */
  answers: Answer[];
}

const N_QUESTIONS = 4;
const MAX_THEME_LEN = 24;

/** 문자열 → base64url */
function b64urlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** base64url → 문자열 */
function b64urlDecode(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/** 0~3 범위로 정규화. */
function clampAns(n: unknown): Answer {
  const v = typeof n === "number" && Number.isFinite(n) ? Math.round(n) : 0;
  return (v < 0 ? 0 : v > 3 ? 3 : v) as Answer;
}

/** 결과 payload → ?d= 값 (v2: answers 0~3). */
export function encodeResult(p: ResultPayload): string {
  const compact = {
    v: 2,
    t: p.theme.slice(0, MAX_THEME_LEN),
    a: p.answers.slice(0, N_QUESTIONS).map(clampAns),
  };
  return b64urlEncode(JSON.stringify(compact));
}

/**
 * ?d= 값 → 결과 payload. 형식이 어긋나면 null.
 * 하위호환: v=1(구 0/1 2지선다) 링크는 0→0(완전 first), 1→3(완전 second)으로 매핑해 해석.
 */
export function decodeResult(d: string): ResultPayload | null {
  try {
    const o = JSON.parse(b64urlDecode(d)) as Record<string, unknown>;
    if (typeof o.t !== "string" || o.t.length === 0) return null;
    if (!Array.isArray(o.a) || o.a.length !== N_QUESTIONS) return null;
    const theme = o.t.slice(0, MAX_THEME_LEN);
    if (o.v === 1) {
      // 구 버전: 0=first / 1=second → 완전(0/3)으로 승격
      const answers = o.a.map((n) => (n === 1 ? 3 : 0)) as Answer[];
      return { theme, answers };
    }
    if (o.v === 2) {
      const answers = o.a.map(clampAns) as Answer[];
      return { theme, answers };
    }
    return null;
  } catch {
    return null;
  }
}
