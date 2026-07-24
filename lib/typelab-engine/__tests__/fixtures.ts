// 테스트 공용 픽스처.

import type { Answer } from "../types";

/** 길이 4의 0/1 답안 조합 16개 전수 열거 (결정적). */
export function allAnswerCombos(): Answer[][] {
  const combos: Answer[][] = [];
  for (let mask = 0; mask < 16; mask++) {
    combos.push([
      ((mask >> 0) & 1) as Answer,
      ((mask >> 1) & 1) as Answer,
      ((mask >> 2) & 1) as Answer,
      ((mask >> 3) & 1) as Answer,
    ]);
  }
  return combos;
}
