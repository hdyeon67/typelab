import { describe, expect, it } from "vitest";
import type { Theme } from "../types";
import { AXES } from "../types";
import { BASE_THEME, THEMES, getTheme } from "../catalog";
import { validateTheme } from "../score";

describe("테마 풀 무결성", () => {
  it("모든 등록 테마는 4축 풀 + 각 축 ≥2 + 문항 axis 가 키와 일치", () => {
    for (const theme of THEMES) {
      expect(validateTheme(theme)).toBeNull();
      for (const axis of AXES) {
        const arr = theme.pool[axis];
        expect(arr.length).toBeGreaterThanOrEqual(2);
        for (const q of arr) expect(q.axis).toBe(axis);
      }
    }
  });

  it("축 풀이 2개 미만이면 거부된다", () => {
    const broken: Theme = {
      ...BASE_THEME,
      pool: { ...BASE_THEME.pool, JP: [BASE_THEME.pool.JP[0]] },
    };
    expect(validateTheme(broken)).not.toBeNull();
  });

  it("풀에 다른 축 문항이 섞이면 거부된다", () => {
    const dup: Theme = {
      ...BASE_THEME,
      pool: { ...BASE_THEME.pool, SN: [BASE_THEME.pool.EI[0], BASE_THEME.pool.SN[1]] },
    };
    expect(validateTheme(dup)).not.toBeNull();
  });

  it("getTheme 은 등록 테마를 찾고, 없으면 undefined", () => {
    expect(getTheme("base")).toBe(BASE_THEME);
    expect(getTheme("nope")).toBeUndefined();
  });
});
