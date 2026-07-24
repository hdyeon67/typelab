import { describe, expect, it } from "vitest";
import type { Answer } from "../types";
import { selectVariant, variantSeed } from "../score";
import { allAnswerCombos } from "./fixtures";

describe("변형 문구 선택", () => {
  it("selectVariant 는 결정적이며 항상 0..poolLen-1 범위다", () => {
    for (const answers of allAnswerCombos()) {
      for (const poolLen of [2, 3]) {
        const idx = selectVariant("base", answers, poolLen, "identity");
        expect(Number.isInteger(idx)).toBe(true);
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(poolLen);
        // 재계산해도 동일
        expect(selectVariant("base", answers, poolLen, "identity")).toBe(idx);
      }
    }
  });

  it("tag 가 다르면 서로 다른 네임스페이스로 선택된다(상관 제거)", () => {
    // 최소 하나의 답안에서 identity 태그와 traits 태그의 결과가 갈리는지 확인
    const combos = allAnswerCombos();
    let anyDiffer = false;
    for (const answers of combos) {
      const a = selectVariant("base", answers, 3, "identity");
      const b = selectVariant("base", answers, 3, "traits");
      if (a !== b) anyDiffer = true;
    }
    expect(anyDiffer).toBe(true);
  });

  it("variantSeed 는 테마·답안에 결정적으로 의존한다", () => {
    const answers = [0, 1, 0, 1] as Answer[];
    expect(variantSeed("base", answers)).toBe(variantSeed("base", answers));
    expect(variantSeed("base", answers)).not.toBe(
      variantSeed("love", answers),
    );
  });
});
