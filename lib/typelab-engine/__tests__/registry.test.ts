import { describe, expect, it } from "vitest";
import { TYPES, getType } from "../type-registry";
import { temperamentOf } from "../axes";
import { scoreAnswers } from "../score";
import { BASE_THEME } from "../catalog";
import { allAnswerCombos } from "./fixtures";

describe("16유형 레지스트리", () => {
  it("정확히 16개이고 코드가 유효한 4글자다", () => {
    expect(TYPES).toHaveLength(16);
    for (const t of TYPES) {
      expect(t.code).toMatch(/^[EI][SN][TF][JP]$/);
    }
  });

  it("코드 ↔ 동물 1:1 (중복·누락 0)", () => {
    const codes = new Set(TYPES.map((t) => t.code));
    const animals = new Set(TYPES.map((t) => t.animal));
    expect(codes.size).toBe(16);
    expect(animals.size).toBe(16);
  });

  it("각 유형의 temperament 는 코드에서 도출한 값과 일치한다", () => {
    for (const t of TYPES) {
      expect(t.temperament).toBe(temperamentOf(t.code));
    }
    // 4기질이 각각 4개씩
    const counts = { NT: 0, NF: 0, SJ: 0, SP: 0 } as Record<string, number>;
    for (const t of TYPES) counts[t.temperament]++;
    expect(counts).toEqual({ NT: 4, NF: 4, SJ: 4, SP: 4 });
  });

  it("채점으로 나오는 16코드가 모두 레지스트리에 존재한다", () => {
    const scored = new Set(
      allAnswerCombos().map((a) => scoreAnswers(BASE_THEME, a).code),
    );
    const registry = new Set(TYPES.map((t) => t.code));
    expect(scored).toEqual(registry);
    for (const code of scored) expect(getType(code)).toBeDefined();
  });

  it("정체성·동물명은 비어 있지 않다", () => {
    for (const t of TYPES) {
      expect(t.animal.trim().length).toBeGreaterThan(0);
      expect(t.oneLiner.trim().length).toBeGreaterThan(0);
    }
  });
});
