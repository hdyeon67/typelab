import { describe, expect, it } from "vitest";
import type { Answer, Pole } from "../types";
import { AXES } from "../types";
import { poleForAnswer, strengthOf, flipPole, AXIS_DEFS } from "../axes";
import { computeConfidence, secondCode, scoreAnswers } from "../score";
import { BASE_THEME } from "../catalog";

describe("poleForAnswer — 4점", () => {
  it("0·1 → first 극, 2·3 → second 극", () => {
    for (const axis of AXES) {
      const [first, second] = [AXIS_DEFS[axis].first.letter, AXIS_DEFS[axis].second.letter];
      expect(poleForAnswer(axis, 0)).toBe(first);
      expect(poleForAnswer(axis, 1)).toBe(first);
      expect(poleForAnswer(axis, 2)).toBe(second);
      expect(poleForAnswer(axis, 3)).toBe(second);
    }
  });
});

describe("strengthOf", () => {
  it("0·3 → 강(1), 1·2 → 약(0)", () => {
    expect(strengthOf(0)).toBe(1);
    expect(strengthOf(3)).toBe(1);
    expect(strengthOf(1)).toBe(0);
    expect(strengthOf(2)).toBe(0);
  });
});

describe("flipPole", () => {
  it("각 극의 반대 극을 반환하고, 두 번 뒤집으면 원위치", () => {
    const pairs: [Pole, Pole][] = [
      ["E", "I"], ["S", "N"], ["T", "F"], ["J", "P"],
    ];
    for (const [a, b] of pairs) {
      expect(flipPole(a)).toBe(b);
      expect(flipPole(b)).toBe(a);
      expect(flipPole(flipPole(a))).toBe(a);
    }
  });
});

describe("computeConfidence", () => {
  it("strongCount 와 level 경계값", () => {
    expect(computeConfidence([0, 0, 0, 0]).strongCount).toBe(4);
    expect(computeConfidence([0, 0, 0, 0]).level).toBe("clear");
    expect(computeConfidence([3, 3, 3, 3]).level).toBe("clear");

    expect(computeConfidence([0, 0, 0, 1]).strongCount).toBe(3);
    expect(computeConfidence([0, 0, 0, 1]).level).toBe("balanced");
    expect(computeConfidence([1, 2, 0, 3]).strongCount).toBe(2);
    expect(computeConfidence([1, 2, 0, 3]).level).toBe("balanced");

    expect(computeConfidence([1, 1, 1, 0]).strongCount).toBe(1);
    expect(computeConfidence([1, 1, 1, 0]).level).toBe("edge");
    expect(computeConfidence([1, 1, 2, 2]).strongCount).toBe(0);
    expect(computeConfidence([1, 1, 2, 2]).level).toBe("edge");
  });

  it("perAxis 는 AXES 순서·극·강약을 담는다", () => {
    const c = computeConfidence([0, 1, 2, 3]);
    expect(c.perAxis.map((a) => a.axis)).toEqual([...AXES]);
    expect(c.perAxis.map((a) => a.strong)).toEqual([true, false, false, true]);
  });
});

describe("secondCode", () => {
  it("약 응답이 없으면(전부 완전) null", () => {
    const answers: Answer[] = [0, 3, 0, 3];
    const code = scoreAnswers(BASE_THEME, answers).code;
    expect(secondCode(code, answers)).toBeNull();
  });

  it("약축이 하나면 그 축 글자만 뒤집는다", () => {
    const answers: Answer[] = [1, 0, 0, 0]; // idx0(EI) 약간
    const code = scoreAnswers(BASE_THEME, answers).code; // ESTJ
    const sec = secondCode(code, answers);
    expect(sec).not.toBeNull();
    // 0번 글자만 다르고, 그 글자는 반대 극
    const positions = [...code].map((c, i) => (c !== sec![i] ? i : -1)).filter((i) => i >= 0);
    expect(positions).toEqual([0]);
    expect(sec![0]).toBe(flipPole(code[0] as Pole));
  });

  it("약축이 여러 개면 AXES 순서상 첫 약축을 뒤집는다", () => {
    const answers: Answer[] = [1, 2, 0, 0]; // idx0·idx1 약간 → 첫 약축 idx0
    const code = scoreAnswers(BASE_THEME, answers).code;
    const sec = secondCode(code, answers)!;
    const positions = [...code].map((c, i) => (c !== sec[i] ? i : -1)).filter((i) => i >= 0);
    expect(positions).toEqual([0]);
  });
});
