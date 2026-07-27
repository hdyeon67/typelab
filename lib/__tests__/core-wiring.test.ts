// 웹판 ↔ typelab-core 배선 스모크.
//
// 채점·문구·인코딩 로직 자체의 회귀 테스트 40개는 typelab-core 저장소가 갖는다
// (`cd ../typelab-core && npm test`). 여기서 지키는 것은 다른 것 하나다:
// **웹판이 코어를 패키지 이름으로 실제 해석해 같은 결과를 낸다**는 것.
// file: 의존·transpilePackages·심볼릭 링크 중 하나라도 깨지면 여기서 먼저 잡힌다.

import { describe, expect, it } from "vitest";
import {
  BASE_THEME,
  THEMES,
  TYPES,
  scoreAnswers,
  buildResultCopy,
  encodeResult,
  decodeResult,
  colorFor,
  emojiFor,
  type Answer,
} from "typelab-core";

describe("typelab-core 배선", () => {
  it("엔진·콘텐츠·테마색·인코딩이 패키지 이름으로 전부 해석된다", () => {
    expect(TYPES).toHaveLength(16);
    expect(THEMES.length).toBeGreaterThanOrEqual(3);
    expect(typeof scoreAnswers).toBe("function");
    expect(typeof buildResultCopy).toBe("function");
    expect(typeof colorFor).toBe("function");
    expect(typeof emojiFor).toBe("function");
  });

  it("공유 링크 왕복 후 같은 결과가 재현된다(?d= 스킴 = 앱인토스판과 공유할 계약)", () => {
    const answers: Answer[] = [0, 3, 1, 2];
    const d = encodeResult({ theme: BASE_THEME.themeId, answers });

    const back = decodeResult(d);
    expect(back).not.toBeNull();
    expect(back!.theme).toBe(BASE_THEME.themeId);
    expect(back!.answers).toEqual(answers);

    // 원본 답안과 왕복 답안이 같은 코드·같은 문구로 조립되어야 한다
    const before = scoreAnswers(BASE_THEME, answers);
    const after = scoreAnswers(BASE_THEME, back!.answers);
    expect(after.code).toBe(before.code);
    expect(JSON.stringify(buildResultCopy(BASE_THEME.themeId, after.code, back!.answers))).toBe(
      JSON.stringify(buildResultCopy(BASE_THEME.themeId, before.code, answers)),
    );
  });

  it("v1 구링크 하위호환이 코어 경유로도 유지된다", () => {
    // v=1(0/1 2지선다) 페이로드를 직접 만들어 디코딩 — 배포된 옛 공유 링크 재현 경로
    const legacy = { v: 1, t: BASE_THEME.themeId, a: [0, 1, 0, 1] };
    const d = btoa(JSON.stringify(legacy)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const back = decodeResult(d);
    expect(back).not.toBeNull();
    expect(back!.answers).toEqual([0, 3, 0, 3]);
  });
});
