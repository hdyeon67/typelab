// 테스트 공용 픽스처.

import type { Answer } from "../types";

/**
 * 길이 4의 "강(완전)" 답안 조합 16개 전수 열거 (결정적).
 * bit 0 → 0(완전 first), 1 → 3(완전 second). 강 응답이라 16코드 전부 도달.
 */
export function allAnswerCombos(): Answer[][] {
  const bit = (m: number, b: number): Answer => (((m >> b) & 1) === 1 ? 3 : 0);
  const combos: Answer[][] = [];
  for (let mask = 0; mask < 16; mask++) {
    combos.push([bit(mask, 0), bit(mask, 1), bit(mask, 2), bit(mask, 3)]);
  }
  return combos;
}

/** 같은 방향의 약(약간) 답으로 바꾼 벡터. 0→1(약간 first), 3→2(약간 second). 코드는 동일. */
export function weaken(answers: readonly Answer[]): Answer[] {
  return answers.map((a) => (a === 0 ? 1 : a === 3 ? 2 : a)) as Answer[];
}
