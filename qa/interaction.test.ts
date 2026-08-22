import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * 상호작용 회귀 검사 — 타입컷 (2026-08-19 이식 · 윤진 소유)
 *
 * ⚠️ 이 파일은 QA 소유다. 개발은 고치지 마라 — 여기가 빨개지면 **화면 코드를 고쳐야 한다.**
 *
 * 왜 생겼나
 * ─────────
 * 알콩(alkong)에서 2026-08-18 에 "버튼을 눌렀는데 화면이 안 바뀐다" 결함 2건이
 * 3주 넘게 회귀 QA 를 통과했다. 대본이 **상태 계산·문구·고지·배포**에 집중돼 있고
 * "눌렀을 때 실제로 바뀌는가" 항목이 하나도 없었기 때문이다.
 *
 *   → 근거: alkong/docs/04-개발기록/전사공지-2026-08-18-상호작용검사-이식.md
 *   → 원본: alkong/qa/interaction.test.ts (베끼지 않고 타입컷 흐름으로 다시 씀)
 *
 * 타입컷이 이식 1순위인 이유: 4문항 슬라이더라 핸들러가 많고,
 * **눌렀는데 안 바뀌면 곧바로 완주율 손실**이다.
 *
 * 검사 층위
 * ─────────
 *   "소스에 있다"        기존 금지어·상수 검사
 *   "코어가 답을 낸다"   lib/__tests__/core-wiring.test.ts · ../typelab-core 40건
 *   "눌렀을 때 바뀐다"   ← 이 파일
 *
 * 검사 대상 경로 (2026-08-19 확인)
 * ─────────
 * 타입컷은 **채점·문구·인코딩 로직이 전부 ../typelab-core 에 있다.** 이 검사는 로직이
 * 아니라 **화면의 상호작용 배선**만 본다. 그래서 대상은 코어가 아니라 이 저장소의
 *   app/         라우트 (랜딩 · /quiz · /result)
 *   components/  실제 핸들러가 사는 곳 ← 알콩과 다른 점. 알콩은 app/ 만 훑으면 됐다.
 * 코어(../typelab-core)는 순수 함수뿐이라 상호작용 검사 대상이 아니다.
 *
 * 한계 (정직하게)
 * ─────────
 * DOM 렌더링 라이브러리가 없으므로 **소스 구조 검사**다. 실제 탭을 재현하지는 못한다.
 * 그래도 "핸들러 본문이 무엇을 부르는가" 수준에서 드러나는 결함은 전부 잡는다.
 */

const ROOT = process.cwd();

/* ───────────────────────── 소스 읽기 ───────────────────────── */

/** 검사가 이름으로 붙잡는 화면들. 파일이 옮겨지면 검사가 조용히 통과하지 않도록 먼저 존재를 확인한다. */
const SCREENS = {
  landing: "app/page.tsx",
  themePicker: "components/landing/ThemePicker.tsx",
  quizRoute: "app/quiz/page.tsx",
  quizRunner: "components/quiz/QuizRunner.tsx",
  resultRoute: "app/result/page.tsx",
  resultActions: "components/result/ResultActions.tsx",
  themeSwitch: "components/result/ThemeSwitch.tsx",
  pngSave: "components/result/PngSaveButton.tsx",
  kakaoShare: "components/result/KakaoShareButton.tsx",
  crossPromo: "components/CrossPromo.tsx",
} as const;

type ScreenKey = keyof typeof SCREENS;

const src: Record<ScreenKey, string> = Object.fromEntries(
  (Object.keys(SCREENS) as ScreenKey[]).map((k) => {
    const p = join(ROOT, SCREENS[k]);
    return [k, existsSync(p) ? readFileSync(p, "utf8") : ""];
  }),
) as Record<ScreenKey, string>;

/** 사용자가 실제로 만지는 화면 파일 전수 (죽은 버튼 스윕용). api 라우트·타입 선언은 제외. */
function screenFiles(dir: string, out: string[] = []): string[] {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) return out;
  for (const name of readdirSync(abs)) {
    const rel = join(dir, name);
    if (statSync(join(ROOT, rel)).isDirectory()) {
      if (name === "api" || name === "node_modules" || name.startsWith(".")) continue;
      screenFiles(rel, out);
    } else if (name.endsWith(".tsx")) {
      out.push(rel);
    }
  }
  return out;
}

const ALL_SCREENS = [...screenFiles("app"), ...screenFiles("components")].map((rel) => ({
  rel,
  code: readFileSync(join(ROOT, rel), "utf8"),
}));

/* ───────────────────────── 구조 추출기 ───────────────────────── */

/** `at` 위치의 여는 괄호와 짝이 맞는 곳까지의 **안쪽** 문자열. */
function balanced(code: string, at: number, open: "{" | "(", close: "}" | ")"): string | null {
  let depth = 0;
  for (let i = at; i < code.length; i++) {
    const ch = code[i];
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return code.slice(at + 1, i);
    }
  }
  return null;
}

/** `onX={ ... }` 본문. 여러 개면 전부. */
function handlerBodies(code: string, prop = "onClick"): { at: number; body: string }[] {
  const key = `${prop}={`;
  const out: { at: number; body: string }[] = [];
  let from = 0;
  for (;;) {
    const at = code.indexOf(key, from);
    if (at < 0) return out;
    const body = balanced(code, at + key.length - 1, "{", "}");
    if (body !== null) out.push({ at, body });
    from = at + key.length;
  }
}

/** `anchor` 문자열 **직전**에 있는 `onX={...}` 본문 — 한 파일에 핸들러가 여럿일 때 특정용. */
function handlerNear(code: string, anchor: string, prop = "onClick"): string | null {
  const a = code.indexOf(anchor);
  if (a < 0) return null;
  const at = code.lastIndexOf(`${prop}={`, a);
  if (at < 0) return null;
  return balanced(code, at + `${prop}={`.length - 1, "{", "}");
}

/** 파일 안에 선언된 함수(`function f() {}` · `const f = () => {}`)의 본문. */
function localFnBody(code: string, name: string): string | null {
  const decl = new RegExp(`function\\s+${name}\\s*\\(`).exec(code);
  const arrow = new RegExp(`(?:const|let)\\s+${name}\\s*=\\s*(?:async\\s*)?\\(`).exec(code);
  const m = decl ?? arrow;
  if (!m) return null;
  const paramOpen = code.indexOf("(", m.index);
  const params = balanced(code, paramOpen, "(", ")");
  if (params === null) return null;
  const brace = code.indexOf("{", paramOpen + params.length + 2);
  return brace < 0 ? null : balanced(code, brace, "{", "}");
}

/**
 * 핸들러 본문 + 그 안에서 부르는 **같은 파일 안 함수들의 본문**을 이어붙인다.
 * 타입컷 핸들러는 대부분 `onClick={() => start(t.themeId)}` · `onClick={save}` 처럼
 * 한 다리 건너 일한다. 알콩처럼 본문만 보면 전부 "아무것도 안 하는 핸들러"로 보인다.
 */
function effective(code: string, body: string, seen = new Set<string>(), depth = 3): string {
  let out = body;
  const names = new Set<string>();
  for (const m of body.matchAll(/\b([a-zA-Z_$][\w$]*)\s*\(/g)) names.add(m[1]);
  const bare = body.trim();
  if (/^[a-zA-Z_$][\w$]*$/.test(bare)) names.add(bare); // onClick={save}
  if (depth > 0) {
    for (const n of names) {
      if (seen.has(n)) continue;
      seen.add(n);
      const b = localFnBody(code, n);
      if (b) out += "\n" + effective(code, b, seen, depth - 1);
    }
  }
  return out;
}

/** `useEffect(...)` 인자 전체(콜백 + 의존성 배열). */
function effectBodies(code: string): string[] {
  const out: string[] = [];
  for (const m of code.matchAll(/useEffect\s*\(/g)) {
    const open = code.indexOf("(", m.index);
    const body = balanced(code, open, "(", ")");
    if (body) out.push(body);
  }
  return out;
}

/** `at` 직전에 열린 JSX 태그 이름 — 버튼인지 링크인지 구분용. */
function tagBefore(code: string, at: number): string {
  let last = "";
  for (const m of code.slice(0, at).matchAll(/<([a-zA-Z][\w.]*)/g)) last = m[1];
  return last;
}

/* ───────────────────────── 0. 검사 대상 경로 ───────────────────────── */

describe("검사 대상 — 이 검사가 진짜 화면을 보고 있는가", () => {
  /**
   * ⚠️ 가장 먼저 깨져야 하는 검사.
   * 파일이 옮겨지거나 이름이 바뀌면 아래 검사들은 빈 문자열을 보고 **조용히 통과**한다.
   * 검사가 초록인 것과 판단이 지켜진 것은 다르다.
   */
  it("붙잡기로 한 화면 파일이 전부 제자리에 있다", () => {
    for (const [key, rel] of Object.entries(SCREENS)) {
      expect(
        existsSync(join(ROOT, rel)),
        `${rel} 이 없습니다 (SCREENS.${key}) — 화면이 옮겨졌거나 이름이 바뀌었습니다. ` +
          `qa/interaction.test.ts 의 SCREENS 를 실제 경로로 맞추세요. ` +
          `그대로 두면 아래 검사들이 빈 파일을 보고 전부 통과합니다.`,
      ).toBe(true);
    }
  });

  it("onClick 을 가진 화면을 실제로 찾아냈다", () => {
    const withHandlers = ALL_SCREENS.filter((f) => handlerBodies(f.code).length > 0);
    expect(
      withHandlers.length,
      `app/·components/ 어디에서도 onClick 을 찾지 못했습니다 — 스캔 경로(ROOT=${ROOT})가 틀렸습니다`,
    ).toBeGreaterThan(0);
  });

  /**
   * 타입컷의 채점·인코딩은 ../typelab-core 소유다(README "불변 계약").
   * 화면이 코어를 우회해 자기 채점을 만들면 웹판·앱인토스판이 갈라지고,
   * 이 상호작용 검사가 보는 배선도 의미를 잃는다.
   */
  it("응시·결과 화면은 채점·인코딩을 typelab-core 에서 가져온다 (직접 구현하지 않는다)", () => {
    expect(
      /from\s+"typelab-core"/.test(src.quizRunner),
      `${SCREENS.quizRunner}: typelab-core 를 import 하지 않습니다 — 화면이 채점을 자체 구현한 것으로 보입니다`,
    ).toBe(true);
    expect(
      /from\s+"typelab-core"/.test(src.resultRoute),
      `${SCREENS.resultRoute}: typelab-core 를 import 하지 않습니다 — 결과 조립이 코어를 우회했습니다`,
    ).toBe(true);

    for (const { rel, code } of ALL_SCREENS) {
      for (const fn of ["scoreAnswers", "decodeResult", "encodeResult", "buildResultCopy"]) {
        expect(
          new RegExp(`function\\s+${fn}\\s*\\(`).test(code),
          `${rel}: ${fn}() 를 화면에서 직접 정의했습니다 — 이 함수는 ../typelab-core 소유입니다. ` +
            `복제하면 웹판과 앱인토스판의 결과가 갈라집니다 (typelab-core/README.md "불변 계약")`,
        ).toBe(false);
      }
    }
  });
});

/* ───────────────────────── 1. 테마 선택 ───────────────────────── */

describe("상호작용 — 테마 선택 (랜딩)", () => {
  it("랜딩이 테마 선택기를 렌더한다", () => {
    expect(
      src.landing.includes("<ThemePicker"),
      `${SCREENS.landing}: <ThemePicker /> 가 없습니다 — 랜딩에서 시작할 방법이 사라집니다`,
    ).toBe(true);
  });

  /** 카드를 손으로 3개 박으면 테마가 늘어도 화면에 안 나온다. 카탈로그를 돌아야 한다. */
  it("테마 카드는 코어 카탈로그(THEMES)를 순회해 렌더한다", () => {
    expect(
      /THEMES\s*\.\s*map\s*\(/.test(src.themePicker),
      `${SCREENS.themePicker}: THEMES.map( 이 없습니다 — 테마 카드가 하드코딩되어 ` +
        `typelab-core 에 테마를 추가해도 랜딩에 나오지 않습니다`,
    ).toBe(true);
  });

  /**
   * ⚠️ 죽은 버튼 검사.
   * 테마 카드를 눌렀는데 계측만 나가고 화면이 그대로면 사용자는 앱이 고장난 줄 안다.
   */
  it("테마 카드 onClick 이 응시 화면으로 실제 이동한다 — 계측만 하면 실패", () => {
    const h = handlerBodies(src.themePicker)[0];
    expect(h, `${SCREENS.themePicker}: onClick 핸들러를 찾지 못했습니다`).toBeTruthy();
    const body = effective(src.themePicker, h!.body);
    expect(
      /router\.(push|replace)\s*\(/.test(body) && body.includes("/quiz"),
      `${SCREENS.themePicker}: 테마 카드를 눌러도 /quiz 로 가지 않습니다 — ` +
        `핸들러가 하는 일: [${[...body.matchAll(/\b([a-zA-Z_$][\w$]*)\s*\(/g)].map((m) => m[1]).join(", ")}]`,
    ).toBe(true);
  });

  /**
   * ⚠️ "어느 카드를 눌러도 같은 테스트" 결함을 잡는다.
   * 이동 URL 의 t= 가 고정 문자열이면 3개 카드가 전부 같은 곳으로 간다.
   */
  it("이동 URL 에 **고른** 테마가 실린다 — t= 가 고정값이면 실패", () => {
    const body = effective(src.themePicker, handlerBodies(src.themePicker)[0]?.body ?? "");
    expect(
      /\/quiz\?t=\$\{/.test(body),
      `${SCREENS.themePicker}: /quiz?t= 뒤가 변수가 아닙니다 — ` +
        `어느 테마 카드를 눌러도 같은 테스트가 열립니다`,
    ).toBe(true);
  });

  it("테마 카드 onClick 이 theme_start 계측을 보낸다 (랜딩→시작 전환율의 분모)", () => {
    const body = effective(src.themePicker, handlerBodies(src.themePicker)[0]?.body ?? "");
    expect(
      /track\(\s*"theme_start"/.test(body),
      `${SCREENS.themePicker}: theme_start 계측이 없습니다 — ` +
        `README 의 핵심 지표(랜딩→theme_start 전환율)를 잴 수 없습니다`,
    ).toBe(true);
  });
});

/* ───────────────────────── 2. 4문항 슬라이더 ───────────────────────── */

describe("상호작용 — 4문항 슬라이더 (응시)", () => {
  it("/quiz 가 QuizRunner 를 렌더한다", () => {
    expect(
      src.quizRoute.includes("<QuizRunner"),
      `${SCREENS.quizRoute}: <QuizRunner /> 가 없습니다 — 응시 화면이 비어 있습니다`,
    ).toBe(true);
  });

  /** 눈금 4개(완전/약간 × 좌/우)는 확신도 계산의 전제다. 개수가 바뀌면 코어 채점과 어긋난다. */
  it("눈금은 0~3 네 칸을 순회해 렌더한다", () => {
    expect(
      /\[\s*0\s*,\s*1\s*,\s*2\s*,\s*3\s*\]\s*\.\s*map\s*\(/.test(src.quizRunner),
      `${SCREENS.quizRunner}: [0,1,2,3].map( 이 없습니다 — 눈금 칸 수가 바뀌면 ` +
        `typelab-core 의 확신도(강/약) 판정 전제가 깨집니다`,
    ).toBe(true);
  });

  /**
   * ⚠️ 핵심 검사 ①.
   * 눈금을 탭했는데 답이 안 남으면 4문항을 다 눌러도 결과가 엉뚱하게 나온다.
   */
  it("눈금 탭이 그 문항의 답을 기록한다", () => {
    const h = handlerNear(src.quizRunner, "aria-pressed");
    expect(h, `${SCREENS.quizRunner}: 눈금 버튼(aria-pressed 근처)의 onClick 을 찾지 못했습니다`).not.toBeNull();
    const body = effective(src.quizRunner, h!);
    expect(
      /setAnswers\s*\(/.test(body),
      `${SCREENS.quizRunner}: 눈금을 탭해도 setAnswers 가 불리지 않습니다 — ` +
        `답이 기록되지 않고 문항만 넘어갑니다`,
    ).toBe(true);
  });

  /**
   * ⚠️ "이전"으로 돌아가 고칠 때 어긋나는 결함을 잡는다.
   * push 로 쌓으면 2번 문항을 고칠 때 5번째 칸에 답이 들어간다.
   */
  it("답은 **현재 문항 자리**에 기록된다 — 배열에 밀어 넣으면 실패", () => {
    const body = effective(src.quizRunner, handlerNear(src.quizRunner, "aria-pressed") ?? "");
    expect(
      /\[\s*idx\s*\]\s*=/.test(body),
      `${SCREENS.quizRunner}: 답을 answers[idx] 에 대입하지 않습니다 — ` +
        `"← 이전"으로 돌아가 고치면 답이 뒤로 밀려 다른 축에 채점됩니다`,
    ).toBe(true);
  });

  /** ⚠️ 핵심 검사 ②. 답만 기록하고 멈추면 사용자는 다음 문항을 못 본다. */
  it("눈금 탭이 다음 문항으로 전진시킨다", () => {
    const body = effective(src.quizRunner, handlerNear(src.quizRunner, "aria-pressed") ?? "");
    expect(
      /setIdx\s*\(/.test(body),
      `${SCREENS.quizRunner}: 눈금을 탭해도 문항 인덱스가 바뀌지 않습니다 — 1번 문항에서 멈춥니다`,
    ).toBe(true);
  });

  /** ⚠️ 마지막 문항에서 아무 일도 안 일어나면 완주율이 0 이 된다. */
  it("마지막 문항의 눈금 탭은 결과 화면으로 보낸다", () => {
    const body = effective(src.quizRunner, handlerNear(src.quizRunner, "aria-pressed") ?? "");
    expect(
      /router\.(push|replace)\s*\(/.test(body) && body.includes("/result"),
      `${SCREENS.quizRunner}: 마지막 문항을 답해도 /result 로 가지 않습니다 — ` +
        `4문항을 다 풀고 빈 화면에 남습니다 (완주율 전량 손실)`,
    ).toBe(true);
  });

  it("결과 이동 URL 에 답안이 실린다 (?d= · 코어 인코딩 경유)", () => {
    const body = effective(src.quizRunner, handlerNear(src.quizRunner, "aria-pressed") ?? "");
    expect(
      /encodeResult\s*\(/.test(body) && /\/result\?d=/.test(body),
      `${SCREENS.quizRunner}: encodeResult 로 만든 ?d= 를 붙여 /result 로 보내지 않습니다 — ` +
        `결과가 재현되지 않고 공유 링크도 깨집니다`,
    ).toBe(true);
  });

  it("완주 시 quiz_complete 계측을 보낸다 (완주율의 분자)", () => {
    const body = effective(src.quizRunner, handlerNear(src.quizRunner, "aria-pressed") ?? "");
    expect(
      /track\(\s*"quiz_complete"/.test(body),
      `${SCREENS.quizRunner}: quiz_complete 계측이 없습니다 — README 의 핵심 지표(완주율)를 잴 수 없습니다`,
    ).toBe(true);
  });

  /** ⚠️ 이름이 약속한 일을 하는가 — 알콩 결함 A 의 정체가 이것이었다. */
  it('"← 이전" 이 문항 인덱스를 실제로 되돌린다', () => {
    const h = handlerNear(src.quizRunner, "이전 문항");
    expect(h, `${SCREENS.quizRunner}: aria-label="이전 문항" 버튼의 onClick 을 찾지 못했습니다`).not.toBeNull();
    expect(
      /setIdx\s*\(\s*idx\s*-\s*1\s*\)/.test(h!),
      `${SCREENS.quizRunner}: "← 이전" 이 setIdx(idx - 1) 을 하지 않습니다 — ` +
        `핸들러 본문: [${h!.trim().slice(0, 80)}]`,
    ).toBe(true);
  });

  /** 첫 문항에서 음수 인덱스로 가면 문항이 undefined 가 되어 화면이 죽는다. */
  it('첫 문항에서 "← 이전" 이 막혀 있다 (가드 또는 disabled)', () => {
    const h = handlerNear(src.quizRunner, "이전 문항") ?? "";
    const guarded = /idx\s*>\s*0/.test(h);
    const disabled = /disabled=\{\s*idx\s*===?\s*0\s*\}/.test(src.quizRunner);
    expect(
      guarded || disabled,
      `${SCREENS.quizRunner}: 첫 문항에서 "← 이전" 을 막지 않습니다 — ` +
        `idx 가 -1 이 되어 questions[-1] 이 undefined 로 터집니다`,
    ).toBe(true);
  });
});

/* ───────────────────────── 3. 결과 화면 재응시 ───────────────────────── */

describe("상호작용 — 결과 화면 재응시", () => {
  it("결과 화면에 다시 해볼 경로가 있다 (테마 전환 + 친구 CTA)", () => {
    expect(
      src.resultRoute.includes("<ThemeSwitch"),
      `${SCREENS.resultRoute}: <ThemeSwitch /> 가 없습니다 — 결과에서 다시 응시할 경로가 사라집니다`,
    ).toBe(true);
    expect(
      src.resultRoute.includes("<ResultActions"),
      `${SCREENS.resultRoute}: <ResultActions /> 가 없습니다 — 공유·재방문 CTA 가 통째로 빠집니다`,
    ).toBe(true);
  });

  it("테마 전환 버튼이 고른 테마로 응시 화면을 연다", () => {
    const body = effective(src.themeSwitch, handlerBodies(src.themeSwitch)[0]?.body ?? "");
    expect(
      /router\.(push|replace)\s*\(/.test(body) && /\/quiz\?t=\$\{/.test(body),
      `${SCREENS.themeSwitch}: 다른 테마 버튼이 /quiz?t=<고른테마> 로 가지 않습니다 — ` +
        `눌러도 결과 화면에 그대로 남습니다`,
    ).toBe(true);
    expect(
      /track\(\s*"theme_switch"/.test(body),
      `${SCREENS.themeSwitch}: theme_switch 계측이 없습니다 — 시리즈 순환 재방문을 잴 수 없습니다`,
    ).toBe(true);
  });

  /** 재응시 링크가 이전 결과 payload 를 물고 가면 새 응시가 옛 결과로 오염된다. */
  it("재응시 링크가 이전 결과(?d=)를 끌고 가지 않는다", () => {
    const body = handlerBodies(src.themeSwitch)[0]?.body ?? "";
    const pushed = /router\.(?:push|replace)\s*\(\s*`([^`]*)`/.exec(effective(src.themeSwitch, body));
    expect(pushed, `${SCREENS.themeSwitch}: router.push 대상 URL 을 읽지 못했습니다`).not.toBeNull();
    expect(
      pushed![1].includes("d="),
      `${SCREENS.themeSwitch}: 재응시 URL(${pushed![1]}) 에 이전 결과 payload 가 남아 있습니다`,
    ).toBe(false);
  });

  /**
   * ⚠️ 핵심 검사 ③ — 전사공지가 명시한 항목.
   * 답과 인덱스 중 **하나만** 초기화하면 "3/4 문항"에서 시작하거나 옛 답이 섞인다.
   * 이 검사는 둘 다를 요구한다.
   */
  it("재응시하면 답·인덱스·문항이 **모두** 초기화된다 — 하나만 지우면 이상한 상태가 된다", () => {
    const reset = effectBodies(src.quizRunner).find((b) => b.includes("buildQuestionSet"));
    expect(
      reset,
      `${SCREENS.quizRunner}: buildQuestionSet 을 부르는 useEffect 를 찾지 못했습니다 — ` +
        `재응시 초기화 지점이 사라졌습니다`,
    ).toBeTruthy();

    const missing = (
      [
        ["setIdx(0)", /setIdx\s*\(\s*0\s*\)/],
        ["setAnswers([])", /setAnswers\s*\(\s*\[\s*\]\s*\)/],
        ["setQuestions(...)", /setQuestions\s*\(/],
      ] as const
    )
      .filter(([, re]) => !re.test(reset!))
      .map(([label]) => label);

    expect(
      missing,
      `${SCREENS.quizRunner}: 재응시 초기화 useEffect 에 [${missing.join(", ")}] 가 없습니다 — ` +
        `문항 인덱스나 이전 답이 남아 재응시가 중간부터 시작되거나 옛 답으로 채점됩니다`,
    ).toEqual([]);
  });

  it("초기화가 테마 변경에 반응한다 (의존성에 theme 이 있다)", () => {
    const reset = effectBodies(src.quizRunner).find((b) => b.includes("buildQuestionSet")) ?? "";
    expect(
      /\[\s*theme\s*\]/.test(reset),
      `${SCREENS.quizRunner}: 초기화 useEffect 의 의존성 배열에 theme 이 없습니다 — ` +
        `다른 테마로 바꿔도 이전 테마의 문항·답이 그대로 남습니다`,
    ).toBe(true);
  });

  it('"친구는 무슨 유형?" CTA 가 실제로 이동한다 — 계측만 하면 실패', () => {
    const h = handlerNear(src.resultActions, "cta_friend_click");
    expect(h, `${SCREENS.resultActions}: cta_friend_click 을 보내는 onClick 을 찾지 못했습니다`).not.toBeNull();
    expect(
      /router\.(push|replace)\s*\(/.test(effective(src.resultActions, h!)),
      `${SCREENS.resultActions}: 친구 CTA 가 계측만 보내고 이동하지 않습니다 — 눌러도 아무 일이 없습니다`,
    ).toBe(true);
  });
});

/* ───────────────────────── 4. 공유 버튼 ───────────────────────── */

describe("상호작용 — 공유 버튼", () => {
  /** ⚠️ 공유는 바이럴의 유일한 통로다. 여기가 죽으면 지표가 아니라 성장이 멈춘다. */
  it("링크 복사가 실제로 클립보드에 쓴다", () => {
    const h = handlerNear(src.resultActions, "복사됨");
    expect(h, `${SCREENS.resultActions}: 링크 복사 버튼의 onClick 을 찾지 못했습니다`).not.toBeNull();
    expect(
      /clipboard\.writeText\s*\(/.test(effective(src.resultActions, h!)),
      `${SCREENS.resultActions}: 복사 버튼이 navigator.clipboard.writeText 를 부르지 않습니다 — ` +
        `눌러도 링크가 복사되지 않습니다`,
    ).toBe(true);
  });

  /** 눌린 티가 안 나면 사용자는 복사가 된 줄 모르고 다시 누른다. 그리고 원래대로 돌아와야 한다. */
  it("복사하면 눌린 티가 나고, 다시 원래대로 돌아온다", () => {
    const body = effective(src.resultActions, handlerNear(src.resultActions, "복사됨") ?? "");
    expect(
      /setCopied\s*\(\s*true\s*\)/.test(body),
      `${SCREENS.resultActions}: 복사 후 setCopied(true) 가 없습니다 — 눌러도 화면이 그대로입니다`,
    ).toBe(true);
    expect(
      /setCopied\s*\(\s*false\s*\)/.test(body),
      `${SCREENS.resultActions}: setCopied(false) 로 되돌리지 않습니다 — "복사됨" 이 영구히 박힙니다`,
    ).toBe(true);
  });

  it("이미지 저장이 실제 다운로드를 일으킨다", () => {
    const h = handlerBodies(src.pngSave)[0];
    expect(h, `${SCREENS.pngSave}: onClick 핸들러를 찾지 못했습니다`).toBeTruthy();
    const body = effective(src.pngSave, h!.body);
    expect(
      /fetch\s*\(/.test(body) && /\.click\s*\(\s*\)/.test(body) && /download/.test(body),
      `${SCREENS.pngSave}: 저장 버튼이 fetch → a.download → click 경로를 완성하지 않습니다 — ` +
        `눌러도 파일이 내려오지 않습니다`,
    ).toBe(true);
  });

  it("카카오 공유가 공유 SDK 를 실제로 호출한다", () => {
    const h = handlerBodies(src.kakaoShare)[0];
    expect(h, `${SCREENS.kakaoShare}: onClick 핸들러를 찾지 못했습니다`).toBeTruthy();
    expect(
      /Kakao\.Share\.sendDefault\s*\(/.test(effective(src.kakaoShare, h!.body)),
      `${SCREENS.kakaoShare}: 카카오 버튼이 Kakao.Share.sendDefault 를 부르지 않습니다 — ` +
        `노란 버튼이 아무 일도 하지 않습니다`,
    ).toBe(true);
  });

  /** 키 미발급 상태에서 버튼만 남으면 "눌러도 안 되는 버튼"이 된다 (회사 표준: env 없으면 미렌더). */
  it("카카오 키가 없으면 버튼을 아예 렌더하지 않는다", () => {
    expect(
      /if\s*\(\s*!\s*KAKAO_ENABLED\s*\)\s*return\s+null/.test(src.kakaoShare),
      `${SCREENS.kakaoShare}: KAKAO_ENABLED 가 false 여도 버튼이 렌더됩니다 — ` +
        `키 미발급 상태에서 눌러도 안 되는 버튼이 남습니다`,
    ).toBe(true);
  });

  it("공유 3종이 각각 share_click 계측을 보낸다", () => {
    const cases: [string, string, string][] = [
      [SCREENS.resultActions, effective(src.resultActions, handlerNear(src.resultActions, "복사됨") ?? ""), "링크 복사"],
      [SCREENS.pngSave, effective(src.pngSave, handlerBodies(src.pngSave)[0]?.body ?? ""), "이미지 저장"],
      [SCREENS.kakaoShare, effective(src.kakaoShare, handlerBodies(src.kakaoShare)[0]?.body ?? ""), "카카오 공유"],
    ];
    for (const [rel, body, label] of cases) {
      expect(
        /track\(\s*"share_click"/.test(body),
        `${rel}: ${label} 이 share_click 계측을 보내지 않습니다 — 공유율 지표에서 이 채널이 통째로 빠집니다`,
      ).toBe(true);
    }
  });
});

/* ───────────────────────── 5. 크로스배너 ───────────────────────── */

describe("상호작용 — 크로스배너", () => {
  it("결과 화면이 크로스배너를 렌더한다", () => {
    expect(
      src.resultRoute.includes("<CrossPromo"),
      `${SCREENS.resultRoute}: <CrossPromo /> 가 없습니다 — 앱 간 유입 통로가 사라집니다`,
    ).toBe(true);
  });

  /** ⚠️ 배너가 <a href> 가 아니면 눌러도 이동하지 않는다 (계측만 나가는 죽은 배너). */
  it("배너가 실제 이동 가능한 링크다 (href 가 데이터에서 온다)", () => {
    expect(
      /href=\{\s*p\.href\s*\}/.test(src.crossPromo),
      `${SCREENS.crossPromo}: href={p.href} 가 없습니다 — 배너를 눌러도 상대 앱으로 이동하지 않습니다 ` +
        `(lib/config/promos.ts 의 href 가 화면에 연결되지 않음)`,
    ).toBe(true);
  });

  it("배너 onClick 이 이동을 막지 않는다", () => {
    const h = handlerBodies(src.crossPromo)[0];
    expect(h, `${SCREENS.crossPromo}: onClick 핸들러를 찾지 못했습니다`).toBeTruthy();
    expect(
      /preventDefault/.test(h!.body),
      `${SCREENS.crossPromo}: onClick 에서 preventDefault 를 부릅니다 — 계측만 나가고 이동이 취소됩니다`,
    ).toBe(false);
  });

  it("배너 클릭이 cross_banner_click 계측을 보낸다", () => {
    const body = effective(src.crossPromo, handlerBodies(src.crossPromo)[0]?.body ?? "");
    expect(
      /track\(\s*"cross_banner_click"/.test(body),
      `${SCREENS.crossPromo}: cross_banner_click 계측이 없습니다 — 크로스 유입률을 잴 수 없습니다`,
    ).toBe(true);
  });

  /** 보여줄 배너가 없는데 제목만 남으면 결과 하단이 빈 칸으로 끝난다. */
  it("보여줄 배너가 없으면 섹션째 감춘다", () => {
    expect(
      /promos\.length\s*===?\s*0\s*\)\s*return\s+null/.test(src.crossPromo),
      `${SCREENS.crossPromo}: 배너가 0개일 때 return null 하지 않습니다 — ` +
        `"이런 것도 있어요" 제목만 남은 빈 섹션이 보입니다`,
    ).toBe(true);
  });
});

/* ───────────────────────── 6. 전수 스윕 ───────────────────────── */

describe("상호작용 — 죽은 버튼 전수 스윕", () => {
  /**
   * ⚠️ 이 파일에서 가장 넓게 그물을 치는 검사.
   * 위 검사들은 오늘 아는 화면만 본다. 새 버튼이 생겨도 여기서는 걸린다.
   * 규칙: <button> 에 붙은 onClick 은 **계측(track) 말고 실제 변화**를 일으켜야 한다.
   *       <a href> 는 이동을 href 가 하므로 계측만 해도 정상이다.
   */
  const ACTION =
    /(set[A-Z]\w*\s*\(|router\.(?:push|replace|back|refresh)\s*\(|window\.|document\.|navigator\.|fetch\s*\(|location\s*[.=])/;

  it("모든 <button> 의 onClick 이 화면을 실제로 바꾼다", () => {
    const dead: string[] = [];
    for (const { rel, code } of ALL_SCREENS) {
      for (const { at, body } of handlerBodies(code)) {
        if (tagBefore(code, at) !== "button") continue;
        const full = effective(code, body);
        if (!ACTION.test(full)) {
          const calls = [...full.matchAll(/\b([a-zA-Z_$][\w$]*)\s*\(/g)].map((m) => m[1]);
          dead.push(`${rel}: onClick={${body.trim().slice(0, 50)}} → 하는 일 [${calls.join(", ") || "없음"}]`);
        }
      }
    }
    expect(
      dead,
      `누르면 아무 변화도 없는 버튼이 있습니다 (상태 변경·이동·브라우저 동작 중 아무것도 안 함):\n` +
        dead.map((d) => `  · ${d}`).join("\n"),
    ).toEqual([]);
  });

  it("빈 핸들러(onClick={() => {}})가 없다", () => {
    const empty: string[] = [];
    for (const { rel, code } of ALL_SCREENS) {
      for (const { body } of handlerBodies(code)) {
        if (/^\s*\(\s*\)\s*=>\s*\{?\s*\}?\s*$/.test(body)) empty.push(`${rel}: onClick={${body.trim()}}`);
      }
    }
    expect(empty, `빈 onClick 핸들러가 남아 있습니다:\n${empty.map((e) => `  · ${e}`).join("\n")}`).toEqual([]);
  });
});
