// 채점: 답안 4개 → 4글자 성향 코드(결정적). 변형 문구 선택 시드도 여기서.

import type { Answer, ScoreResult, Theme } from "./types";
import { AXES } from "./types";
import { poleForAnswer, temperamentOf } from "./axes";
import { deriveIndex, fnv1a } from "./hash";

/** 테마 풀 검증: 4축이 모두 있고, 각 축 길이 ≥2, 각 문항 axis 가 키와 일치. 통과 시 null. */
export function validateTheme(theme: Theme): string | null {
  for (const axis of AXES) {
    const arr = theme.pool[axis];
    if (!arr || arr.length < 2) {
      return `축 ${axis} 풀은 2개 이상이어야 하는데 ${arr?.length ?? 0}개입니다`;
    }
    for (const q of arr) {
      if (q.axis !== axis) return `축 ${axis} 풀에 다른 축(${q.axis}) 문항이 있습니다`;
    }
  }
  return null;
}

/**
 * 답안 → 4글자 코드 + 4기질.
 * 응시 제시 순서는 항상 축 순서(EI,SN,TF,JP)로 고정되므로 answers[i] = AXES[i] 로 해석한다.
 * 어떤 문항 변형을 봤는지와 무관하게 축별 선택(0/1)만으로 결정 → 결과 재현성 보존.
 */
export function scoreAnswers(theme: Theme, answers: readonly Answer[]): ScoreResult {
  if (answers.length !== AXES.length) {
    throw new Error(`답안 수(${answers.length})가 축 수(${AXES.length})와 다릅니다`);
  }
  const code = AXES.map((axis, i) => poleForAnswer(axis, answers[i])).join("");
  return { code, temperament: temperamentOf(code) };
}

/**
 * 변형 시드 = fnv1a(themeId + "|" + 답안열).
 * 같은 테마·같은 답이면 항상 같은 시드 → 재방문·공유에서 문구가 결정적으로 재현된다.
 */
export function variantSeed(themeId: string, answers: readonly Answer[]): number {
  return fnv1a(`${themeId}|${answers.join("")}`);
}

/**
 * 유형별 변형 문구 풀에서 결정적으로 인덱스 하나(0..poolLen-1)를 고른다.
 * tag 로 서로 다른 문구 종류(정체성/특징/케미 등)를 네임스페이스화한다.
 */
export function selectVariant(
  themeId: string,
  answers: readonly Answer[],
  poolLen: number,
  tag: string,
): number {
  return deriveIndex(variantSeed(themeId, answers), tag, poolLen);
}
