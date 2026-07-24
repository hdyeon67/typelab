import { describe, expect, it } from "vitest";
import { scoreAnswers } from "../score";
import { BASE_THEME } from "../catalog";
import { allAnswerCombos } from "./fixtures";

describe("채점 결정성", () => {
  it("같은 (테마, 답안) 은 1000회 반복해도 동일한 코드/기질을 낸다", () => {
    for (const answers of allAnswerCombos()) {
      const first = JSON.stringify(scoreAnswers(BASE_THEME, answers));
      for (let i = 0; i < 1000; i++) {
        expect(JSON.stringify(scoreAnswers(BASE_THEME, answers))).toBe(first);
      }
    }
  });

  it("모든 코드는 유효한 4글자다", () => {
    for (const answers of allAnswerCombos()) {
      const { code } = scoreAnswers(BASE_THEME, answers);
      expect(code).toMatch(/^[EI][SN][TF][JP]$/);
    }
  });
});
