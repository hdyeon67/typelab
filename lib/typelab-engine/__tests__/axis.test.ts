import { describe, expect, it } from "vitest";
import type { Answer } from "../types";
import { AXES } from "../types";
import { scoreAnswers } from "../score";
import { BASE_THEME, THEMES, buildQuestionSet } from "../catalog";
import { allAnswerCombos } from "./fixtures";

/** 두 코드에서 서로 다른 위치의 인덱스 목록. */
function diffPositions(a: string, b: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) out.push(i);
  return out;
}

describe("각 답은 지정 축만 움직인다", () => {
  it("답 i 만 뒤집으면 코드에서 축 i(AXES 순서) 글자 하나만 바뀐다", () => {
    for (const base of allAnswerCombos()) {
      const baseCode = scoreAnswers(BASE_THEME, base).code;
      for (let i = 0; i < AXES.length; i++) {
        const flipped = [...base] as Answer[];
        flipped[i] = (base[i] === 0 ? 1 : 0) as Answer;
        const positions = diffPositions(baseCode, scoreAnswers(BASE_THEME, flipped).code);
        expect(positions).toHaveLength(1);
        expect(positions[0]).toBe(i);
      }
    }
  });
});

describe("변형 독립성 — 어떤 변형을 제시했든 결과 코드 동일", () => {
  it("scoreAnswers 는 제시 변형(문항 세트)과 무관하게 answers 로만 결정된다", () => {
    for (const theme of THEMES) {
      // 변형 A(전부 0번) / 변형 B(각 축 마지막) 제시 — 채점에 영향 없어야 한다.
      buildQuestionSet(theme, () => 0);
      buildQuestionSet(theme, (_a, len) => len - 1);
      for (const answers of allAnswerCombos()) {
        const expected = scoreAnswers(theme, answers).code;
        // 여러 번 호출해도(어떤 세트를 제시했든) 항상 동일
        expect(scoreAnswers(theme, answers).code).toBe(expected);
      }
    }
  });
});

describe("buildQuestionSet 뽑기", () => {
  it("축당 정확히 1개, 항상 AXES 순서로 반환", () => {
    for (const theme of THEMES) {
      const set = buildQuestionSet(theme, () => 0);
      expect(set).toHaveLength(AXES.length);
      expect(set.map((q) => q.axis)).toEqual([...AXES]);
    }
  });

  it("pick 인덱스가 해당 변형을 고른다", () => {
    const first = buildQuestionSet(BASE_THEME, () => 0);
    const last = buildQuestionSet(BASE_THEME, (_a, len) => len - 1);
    expect(first[0]).toBe(BASE_THEME.pool.EI[0]);
    expect(last[0]).toBe(BASE_THEME.pool.EI[BASE_THEME.pool.EI.length - 1]);
  });

  it("범위를 벗어난 pick 은 클램프된다", () => {
    const set = buildQuestionSet(BASE_THEME, () => 999);
    expect(set.map((q) => q.axis)).toEqual([...AXES]);
  });
});
