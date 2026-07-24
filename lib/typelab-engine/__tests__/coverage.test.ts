import { describe, expect, it } from "vitest";
import { scoreAnswers } from "../score";
import { BASE_THEME } from "../catalog";
import { allAnswerCombos } from "./fixtures";

describe("16코드 도달 가능성", () => {
  it("16개 답안 조합이 서로 다른 16개 코드를 정확히 만든다", () => {
    const codes = allAnswerCombos().map((a) => scoreAnswers(BASE_THEME, a).code);
    const unique = new Set(codes);
    expect(codes).toHaveLength(16);
    expect(unique.size).toBe(16);
  });
});
