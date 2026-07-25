import { describe, expect, it } from "vitest";
import type { Answer } from "@/lib/typelab-engine";
import { encodeResult, decodeResult } from "../encode";

/** encode.ts 와 동일한 base64url 인코딩 (v1 페이로드 수제작용). */
function b64url(obj: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

describe("encode v2", () => {
  it("왕복(roundtrip): 0~3 답안 보존", () => {
    const answers: Answer[] = [0, 1, 2, 3];
    const d = encodeResult({ theme: "base", answers });
    expect(decodeResult(d)).toEqual({ theme: "base", answers });
  });

  it("답안 4개·테마 문자열 유지", () => {
    const d = encodeResult({ theme: "love", answers: [3, 3, 3, 3] });
    const p = decodeResult(d)!;
    expect(p.theme).toBe("love");
    expect(p.answers).toEqual([3, 3, 3, 3]);
  });
});

describe("encode v1 하위호환", () => {
  it("v=1(구 0/1) 링크는 0→0, 1→3 으로 해석", () => {
    const legacy = b64url({ v: 1, t: "base", a: [0, 1, 0, 1] });
    expect(decodeResult(legacy)).toEqual({ theme: "base", answers: [0, 3, 0, 3] });
  });
});

describe("decodeResult 방어", () => {
  it("잘못된 형식은 null", () => {
    expect(decodeResult("!!!not-base64!!!")).toBeNull();
    expect(decodeResult(b64url({ v: 2, t: "base", a: [0, 1, 2] }))).toBeNull(); // 길이 3
    expect(decodeResult(b64url({ v: 2, t: "", a: [0, 0, 0, 0] }))).toBeNull(); // 빈 테마
    expect(decodeResult(b64url({ v: 9, t: "base", a: [0, 0, 0, 0] }))).toBeNull(); // 미지원 버전
  });

  it("v2 범위 밖 값은 0~3 으로 클램프", () => {
    const p = decodeResult(b64url({ v: 2, t: "base", a: [-5, 7, 2, 1] }))!;
    expect(p.answers).toEqual([0, 3, 2, 1]);
  });
});
