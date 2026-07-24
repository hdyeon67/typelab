import { describe, expect, it } from "vitest";
import type { Answer } from "@/lib/typelab-engine";
import { TYPES, THEMES, scoreAnswers, getType } from "@/lib/typelab-engine";
import { TYPE_DETAILS } from "../type-detail";
import { THEME_COMMENTS } from "../theme-comments";
import { buildResultCopy } from "../select";
import { allAnswerCombos } from "@/lib/typelab-engine/__tests__/fixtures";

describe("16유형 본체 데이터", () => {
  it("모든 코드에 detail 이 있고 케미가 유효한 코드를 가리킨다", () => {
    for (const t of TYPES) {
      const d = TYPE_DETAILS[t.code];
      expect(d, `detail for ${t.code}`).toBeDefined();
      expect(d.identities).toHaveLength(2);
      expect(d.traitSets).toHaveLength(2);
      for (const set of d.traitSets) expect(set).toHaveLength(3);
      // 케미 대상은 실제 존재하는 유형이어야 한다
      expect(getType(d.chemi.match), `${t.code} match`).toBeDefined();
      expect(getType(d.chemi.clash), `${t.code} clash`).toBeDefined();
    }
  });

  it("빈 문구가 없다", () => {
    for (const d of Object.values(TYPE_DETAILS)) {
      for (const s of [...d.identities, ...d.traitSets.flat(), d.chemi.matchLine, d.chemi.clashLine]) {
        expect(s.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

describe("테마 코멘트 풀", () => {
  it("등록된 모든 테마 × 16유형에 코멘트가 있다", () => {
    for (const theme of THEMES) {
      const pool = THEME_COMMENTS[theme.themeId];
      expect(pool, `comments for ${theme.themeId}`).toBeDefined();
      for (const t of TYPES) {
        expect(pool[t.code]?.length, `${theme.themeId}/${t.code}`).toBeGreaterThan(0);
      }
    }
  });
});

describe("문구 풀 규모", () => {
  it("사전 생성 문구가 최소 200개 이상이다", () => {
    let count = 0;
    for (const d of Object.values(TYPE_DETAILS)) {
      count += d.identities.length; // 32
      count += d.traitSets.flat().length; // 96
      count += 2; // matchLine + clashLine → 32
    }
    for (const pool of Object.values(THEME_COMMENTS)) {
      for (const arr of Object.values(pool)) count += arr.length;
    }
    expect(count).toBeGreaterThanOrEqual(200);
  });
});

describe("결과 문구 조립 결정성", () => {
  it("같은 (테마, 코드, 답안) 은 동일한 ResultCopy 를 낸다", () => {
    for (const theme of THEMES) {
      for (const answers of allAnswerCombos()) {
        const code = scoreAnswers(theme, answers).code;
        const first = JSON.stringify(buildResultCopy(theme.themeId, code, answers));
        for (let i = 0; i < 50; i++) {
          expect(JSON.stringify(buildResultCopy(theme.themeId, code, answers as Answer[]))).toBe(first);
        }
      }
    }
  });

  it("모든 테마에서 16코드 전부 정상 조립된다", () => {
    for (const theme of THEMES) {
      const codes = new Set(allAnswerCombos().map((a) => scoreAnswers(theme, a).code));
      expect(codes.size).toBe(16);
      for (const code of codes) {
        const copy = buildResultCopy(theme.themeId, code, [0, 0, 0, 0]);
        expect(copy.traits).toHaveLength(3);
        expect(copy.identity.length).toBeGreaterThan(0);
        expect(copy.themeComment.length).toBeGreaterThan(0);
      }
    }
  });
});
